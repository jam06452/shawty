import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import { parseUserAgent, getLocationFromIP, getClientIP } from '$lib/analytics';

// Async function to track analytics without blocking the redirect
async function trackAnalytics(linkId: string, linkClicks: number, shortCode: string, userAgent: string, referrer: string | undefined, ip: string) {
  const { device, os, browser } = parseUserAgent(userAgent);

  // Get location with timeout
  let location = { country: undefined, city: undefined };
  try {
    const locationPromise = getLocationFromIP(ip);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ country: undefined, city: undefined }), 1000));
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
  // Fetch link data only
  const { data: link, error: linkError } = await supabase
    .from('links')
    .select('id, long_url, clicks, password')
    .eq('short_code', params.code)
    .single();

  if (linkError || !link) {
    console.error('Link not found:', linkError);
    return new Response('Not found', { status: 404 });
  }

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
