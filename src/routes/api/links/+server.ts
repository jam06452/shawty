import { supabase } from '$lib/supabase';
import { redirect, error } from '@sveltejs/kit';
import { PUBLIC_URL } from '$env/static/public';
import type { RequestHandler } from '@sveltejs/kit';

// Get the hostname from PUBLIC_URL to block self-referencing links
const getHostname = (url: string): string | null => {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
};

export const GET: RequestHandler = async ({ locals, url }) => {
    // Check authentication
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: links, count, error: dbError } = await supabase
        .from('links')
        .select('*', { count: 'exact' })
        .eq('user_id', locals.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (dbError) {
        console.error('Database error:', dbError);
        return new Response(JSON.stringify({ error: 'Failed to fetch links' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        links: links || [],
        page,
        limit,
        total: count || 0
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

const BLOCKED_HOSTNAMES = [
    getHostname(PUBLIC_URL), // e.g., www.shawty.app
    'www.shawty.app',
    'shawty.app',
].filter(Boolean) as string[];

// Validate that URL doesn't point to our own domain (prevents loops)
const validateUrlNotSelfReferencing = (url: string): boolean => {
    const hostname = getHostname(url);
    if (!hostname) return false;
    
    // Check if hostname matches any blocked hostname
    return !BLOCKED_HOSTNAMES.some(blocked => 
        hostname === blocked || hostname.endsWith(`.${blocked}`)
    );
};

// Send Slack notification
const sendSlackAlert = async (user: any, attemptedUrl: string, action: 'create' | 'update') => {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    if (!SLACK_WEBHOOK_URL) {
        console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
        return;
    }

    const displayName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.name || user.email;

    const slackMention = user.slack_id ? `<@${user.slack_id}>` : displayName;

    const message = {
        text: `🚨 Loop Protection Alert`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🚨 Attempted Self-Referencing Link",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*User:*\n${slackMention}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Action:*\n${action === 'create' ? 'Create new link' : 'Update existing link'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Email:*\n${user.email || 'N/A'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Slack ID:*\n${user.slack_id || 'N/A'}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Attempted URL:*\n\`${attemptedUrl}\``
                }
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `Blocked at ${new Date().toISOString()}`
                    }
                ]
            }
        ]
    };

    try {
        await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
    } catch (err) {
        console.error('Failed to send Slack notification:', err);
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    // Check authentication
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        let { url, customSlug, password } = body;

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Add https:// if no protocol is specified
        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prevent self-referencing links (loop protection)
        if (!validateUrlNotSelfReferencing(url)) {
            // Send Slack alert asynchronously
            sendSlackAlert(locals.user, url, 'create').catch(err =>
                console.error('Failed to send Slack alert:', err)
            );
            return new Response(JSON.stringify({ error: 'Cannot create shortlinks that point to this domain' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Handle custom slug
        let shortCode: string;
        let isCustom = false;

        if (customSlug) {
            customSlug = customSlug.trim();
            // Validate custom slug: alphanumeric and hyphens only, 3-20 chars
            if (!/^[a-zA-Z0-9-]{3,20}$/.test(customSlug)) {
                return new Response(JSON.stringify({ error: 'Custom slug must be 3-20 characters (letters, numbers, hyphens only)' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Check if slug is already taken
            const { data: existing } = await supabase
                .from('links')
                .select('id')
                .eq('short_code', customSlug)
                .single();

            if (existing) {
                return new Response(JSON.stringify({ error: 'This custom slug is already taken' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            shortCode = customSlug;
            isCustom = true;
        } else {
            // Generate random short code (6 random characters)
            shortCode = Math.random().toString(36).substring(2, 8);
        }

        // Insert into database
        const { error: dbError } = await supabase.from('links').insert({
            short_code: shortCode,
            long_url: url,
            user_id: locals.user.id,
            clicks: 0,
            on_leaderboard: false,
            custom_slug: isCustom,
            password: password || null
        });

        if (dbError) {
            console.error('Database error:', dbError);
            if (dbError.code === '23505') {
                return new Response(JSON.stringify({ error: 'This slug is already taken' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return new Response(JSON.stringify({ error: 'Failed to create short link' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            shortCode
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('API error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
