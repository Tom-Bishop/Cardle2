// This file handles GET /api/admin/users and GET /api/admin/users?targetUser=...
// It was moved from admin.js to match Cloudflare Pages Functions routing.

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Verify admin (must be Tom) - check query param
    const adminUsername = url.searchParams.get('username');
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const targetUser = url.searchParams.get('targetUser');
        let query = `
            SELECT 
                u.id, u.username, u.created_at,
                COALESCE(s.wins, 0) as wins, 
                COALESCE(s.games_played, 0) as games_played, 
                COALESCE(s.total_guesses, 0) as total_guesses, 
                COALESCE(s.total_time_seconds, 0) as total_time_seconds,
                COALESCE(s.daily_won, 0) as daily_won, 
                COALESCE(s.daily_played, 0) as daily_played, 
                COALESCE(s.daily_streak, 0) as daily_streak, 
                COALESCE(s.daily_max_streak, 0) as daily_max_streak,
                COALESCE(s.random_won, 0) as random_won, 
                COALESCE(s.random_played, 0) as random_played, 
                COALESCE(s.random_streak, 0) as random_streak, 
                COALESCE(s.random_max_streak, 0) as random_max_streak,
                COALESCE(s.streak_days, 0) as streak_days, 
                COALESCE(s.max_streak, 0) as max_streak, 
                COALESCE(s.daily_plays, 0) as daily_plays,
                COALESCE(s.daily_wins, 0) as daily_wins,
                COALESCE(s.daily_losses, 0) as daily_losses,
                COALESCE(s.daily_guesses, 0) as daily_guesses,
                COALESCE(s.daily_time, 0) as daily_time,
                COALESCE(s.random_plays, 0) as random_plays,
                COALESCE(s.random_wins, 0) as random_wins,
                COALESCE(s.random_losses, 0) as random_losses,
                COALESCE(s.random_guesses, 0) as random_guesses,
                COALESCE(s.random_time, 0) as random_time,
                COALESCE(s.total_plays, 0) as total_plays,
                COALESCE(s.total_wins, 0) as total_wins,
                COALESCE(s.total_losses, 0) as total_losses,
                s.last_daily_play
            FROM users u
            LEFT JOIN stats s ON u.id = s.user_id
        `;
        let result;
        if (targetUser) {
            query += ` WHERE u.username = ?`;
            result = await env.DB.prepare(query).bind(targetUser).all();
        } else {
            result = await env.DB.prepare(query).all();
        }
        const users = result.results || [];
        return new Response(JSON.stringify(users), { 
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
