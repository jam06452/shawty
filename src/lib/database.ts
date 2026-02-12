import { supabase } from '$lib/supabase';

export interface FetchLinksParams {
    userId: string;
    page?: number;
    limit?: number;
}

export interface FetchLinksResult {
    links: any[] | null;
    page: number;
    limit: number;
    total: number;
}

// Fetch user's links with pagination
export const fetchUserLinks = async ({
    userId,
    page = 1,
    limit = 20
}: FetchLinksParams): Promise<FetchLinksResult> => {
    const offset = (page - 1) * limit;

    const { data: links, count, error } = await supabase
        .from('links')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Database error:', error);
        throw error;
    }

    return {
        links: links || [],
        page,
        limit,
        total: count || 0
    };
};
