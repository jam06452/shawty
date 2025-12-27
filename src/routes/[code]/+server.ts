import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import { parseUserAgent, getLocationFromIP, getClientIP } from '$lib/analytics';

export const GET = async ({ params, request }) => {
  const { data: link, error: linkError } = await supabase
    .from('links')
    .select('id, long_url, clicks')
    .eq('short_code', params.code)
    .single();

  if (linkError || !link) {
    console.error('Link not found:', linkError);
    return new Response('Not found', { status: 404 });
  }

  // Parse user agent
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || undefined;
  const ip = getClientIP(request);

  const { device, os, browser } = parseUserAgent(userAgent);

  // Get location (with timeout to avoid blocking redirect)
  let location = { country: undefined, city: undefined };
  try {
    const locationPromise = getLocationFromIP(ip);
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ country: undefined, city: undefined }), 2000));
    location = await Promise.race([locationPromise, timeoutPromise]) as any;
  } catch (error) {
    console.error('Failed to get location:', error);
  }

  // Insert click record
  const { error: clickError } = await supabase.from('link_clicks').insert({
    link_id: link.id,
    ip_address: ip,
    country: location.country || null,
    city: location.city || null,
    device,
    os,
    browser,
    user_agent: userAgent,
    referrer: referrer || null
  });

  if (clickError) {
    console.error('Failed to insert click:', clickError);
  }

  // Update click count
  const { error: updateError } = await supabase
    .from('links')
    .update({ clicks: link.clicks + 1 })
    .eq('short_code', params.code);

  if (updateError) {
    console.error('Failed to update clicks:', updateError);
  }

  throw redirect(302, link.long_url);
};
