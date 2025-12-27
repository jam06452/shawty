import { supabase } from '$lib/supabase';

export const load = async () => {
    const { data: links } = await supabase
        .from('links')
        .select('id, short_code, long_url, clicks')
        .eq('on_leaderboard', true)
        .order('clicks', { ascending: false })
        .limit(50);

    return { links };
};