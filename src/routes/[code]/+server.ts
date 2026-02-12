import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import { parseUserAgent, getLocationFromIP, getClientIP } from '$lib/analytics';

// Simple in-memory cache (resets on deploy, but that's fine)
const linkCache = new Map<string, { long_url: string, password: string | null, id: string, clicks: number, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

// Async function to track analytics without blocking the redirect
async function trackAnalytics(linkId: string, linkClicks: number, shortCode: string, userAgent: string, referrer: string | undefined, ip: string) {
  const { device, os, browser } = parseUserAgent(userAgent);

  // Get location with timeout (reduced to 500ms)
  let location = { country: undefined, city: undefined };
  try {
    const locationPromise = getLocationFromIP(ip);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ country: undefined, city: undefined }), 500));
    location = await Promise.race([locationPromise, timeoutPromise]) as any;
  } catch (error) {
    console.error('Failed to get location:', error);
  }

  // Perform both database operations in parallel
  await Promise.all([
    supabase.from('link_clicks').insert({
      link_id: linkId,
      ip_address: ip,
      country: location.country || null,
      city: location.city || null,
      device,
      os,
      browser,
      user_agent: userAgent,
      referrer: referrer || null
    }),
    supabase
      .from('links')
      .update({ clicks: linkClicks + 1 })
      .eq('short_code', shortCode)
  ]).catch(error => {
    console.error('Failed to track analytics:', error);
  });
}

export const GET = async ({ params, request, cookies }) => {
  const now = Date.now();
  
  // Check cache first
  let link = linkCache.get(params.code);
  if (!link || now - link.timestamp > CACHE_TTL) {
    // Fetch from database - only select necessary fields
    const { data, error: linkError } = await supabase
      .from('links')
      .select('id, long_url, clicks, password')
      .eq('short_code', params.code)
      .single();

    if (linkError || !data) {
      console.error('Link not found:', linkError);
      return new Response('Not found', { status: 404 });
    }
    
    // Cache it
    link = { ...data, timestamp: now };
    linkCache.set(params.code, link);
  }

  // Password check
  if (link.password) {
    const verified = cookies.get(`verified_${params.code}`);
    if (verified !== 'true') {
      throw redirect(302, `/${params.code}/verify`);
    }
  }

  // Start analytics tracking in background (don't await)
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || undefined;
  const ip = getClientIP(request);
  
  trackAnalytics(link.id, link.clicks, params.code, userAgent, referrer, ip);

  // Redirect immediately
  throw redirect(302, link.long_url);
};
