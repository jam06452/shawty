import { supabase } from '$lib/supabase';
import { redirect, fail } from '@sveltejs/kit';
import { PUBLIC_URL } from '$env/static/public';

// Get the hostname from PUBLIC_URL to block self-referencing links
const getHostname = (url: string): string | null => {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
};

const BLOCKED_HOSTNAMES = [
    getHostname(PUBLIC_URL), // e.g., vejas.site
    'vejas.site',
    'www.vejas.site',
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

export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const { data: links } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', locals.user.id)
        .order('created_at', { ascending: false });

    return { links };
};

export const actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const formData = await request.formData();
        let url = formData.get('url')?.toString();
        let customSlug = formData.get('customSlug')?.toString()?.trim();

        if (!url) {
            return fail(400, { error: 'URL is required' });
        }

        // Add https:// if no protocol is specified
        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return fail(400, { error: 'Invalid URL format' });
        }

        // Prevent self-referencing links (loop protection)
        if (!validateUrlNotSelfReferencing(url)) {
            return fail(400, { error: 'Cannot create shortlinks that point to this domain (prevents infinite loops)' });
        }

        // Handle custom slug
        let shortCode: string;
        let isCustom = false;

        if (customSlug) {
            // Validate custom slug: alphanumeric and hyphens only, 3-20 chars
            if (!/^[a-zA-Z0-9-]{3,20}$/.test(customSlug)) {
                return fail(400, { error: 'Custom slug must be 3-20 characters (letters, numbers, hyphens only)' });
            }

            // Check if slug is already taken
            const { data: existing } = await supabase
                .from('links')
                .select('id')
                .eq('short_code', customSlug)
                .single();

            if (existing) {
                return fail(400, { error: 'This custom slug is already taken' });
            }

            shortCode = customSlug;
            isCustom = true;
        } else {
            // Generate random short code (6 random characters)
            shortCode = Math.random().toString(36).substring(2, 8);
        }

        // Insert into database
        const { error } = await supabase.from('links').insert({
            short_code: shortCode,
            long_url: url,
            user_id: locals.user.id,
            clicks: 0,
            on_leaderboard: false,
            custom_slug: isCustom,
        });

        if (error) {
            console.error('Database error:', error);
            if (error.code === '23505') { // Unique constraint violation
                return fail(400, { error: 'This slug is already taken' });
            }
            return fail(500, { error: 'Failed to create short link' });
        }

        return { success: true, shortCode };
    },

    update: async ({ request, locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const formData = await request.formData();
        const linkId = formData.get('linkId')?.toString();
        let newUrl = formData.get('newUrl')?.toString();

        if (!linkId) {
            return fail(400, { error: 'Link ID is required' });
        }

        if (!newUrl || newUrl.trim() === '') {
            return fail(400, { error: 'URL cannot be empty' });
        }

        if (!newUrl.match(/^https?:\/\//i)) {
            newUrl = 'https://' + newUrl;
        }

        try {
            new URL(newUrl);
        } catch {
            return fail(400, { error: 'Invalid URL format' });
        }

        // Prevent self-referencing links (loop protection)
        if (!validateUrlNotSelfReferencing(newUrl)) {
            return fail(400, { error: 'Cannot update to a URL that points to this domain (prevents infinite loops)' });
        }

        const { error } = await supabase
            .from('links')
            .update({ long_url: newUrl })
            .eq('id', linkId)
            .eq('user_id', locals.user.id);

        if (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Failed to update link' });
        }

        return { updated: true };
    },

    toggleLeaderboard: async ({ request, locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const formData = await request.formData();
        const linkId = formData.get('linkId')?.toString();
        const currentStatus = formData.get('currentStatus') === 'true';

        if (!linkId) {
            return fail(400, { error: 'Link ID is required' });
        }

        const { error } = await supabase
            .from('links')
            .update({ on_leaderboard: !currentStatus })
            .eq('id', linkId)
            .eq('user_id', locals.user.id);

        if (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Failed to update leaderboard status' });
        }

        return { toggled: true };
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) throw redirect(302, '/login');

        const formData = await request.formData();
        const linkId = formData.get('linkId')?.toString();

        if (!linkId) {
            return fail(400, { error: 'Link ID is required' });
        }

        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', linkId)
            .eq('user_id', locals.user.id);

        if (error) {
            console.error('Database error:', error);
            return fail(500, { error: 'Failed to delete link' });
        }

        return { deleted: true };
    }
};
