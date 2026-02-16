import { verifyAdminAuth, getSecureCorsHeaders } from './_admin-auth.js';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: getSecureCorsHeaders() });
    }
    
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request, env);
    if (!authResult.authorized) {
        return new Response(
            JSON.stringify({ error: authResult.error }), 
            { status: authResult.status, headers: getSecureCorsHeaders() }
        );
    }

    // Parse request body
    let body = {};
    if (request.method !== 'GET') {
        try {
            body = await request.json();
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }
    }

    // Route by method
    if (request.method === 'GET') {
        return handleGetUsers(env, url);
    } else if (request.method === 'POST') {
        const action = url.pathname.split('/').pop(); // e.g., 'delete-user', 'wipe-data'
        
        if (action === 'delete-user') {
            return handleDeleteUser(env, body);
        } else if (action === 'wipe-data') {
            return handleWipeData(env);
        } else if (action === 'update-user-stats') {
            return handleUpdateUserStats(env, body);
        } else {
            return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: getSecureCorsHeaders() });
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: getSecureCorsHeaders() });
}

// GET /api/admin/users - List all users with stats
async function handleGetUsers(env, url) {
    try {
        const targetUser = url.searchParams.get('targetUser');
        
        let query = `
            SELECT 
                u.id, u.username, u.created_at,
                COALESCE(s.wins, 0) as wins, 
                COALESCE(s.games_played, 0) as games_played, 
                COALESCE(s.total_guesses, 0) as total_guesses, 
                COALESCE(s.total_time_seconds, 0) as total_time_seconds,
                COALESCE(s.daily_wins, 0) as daily_wins, 
                COALESCE(s.daily_plays, 0) as daily_plays, 
                COALESCE(s.daily_streak, 0) as daily_streak, 
                COALESCE(s.daily_max_streak, 0) as daily_max_streak,
                COALESCE(s.random_wins, 0) as random_wins, 
                COALESCE(s.random_plays, 0) as random_plays, 
                COALESCE(s.random_streak, 0) as random_streak, 
                COALESCE(s.random_max_streak, 0) as random_max_streak,
                COALESCE(s.streak_days, 0) as streak_days, 
                COALESCE(s.max_streak, 0) as max_streak,
                COALESCE(s.daily_losses, 0) as daily_losses,
                COALESCE(s.daily_guesses, 0) as daily_guesses,
                COALESCE(s.daily_time, 0) as daily_time,
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
            headers: getSecureCorsHeaders()
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}

// POST /api/admin/delete-user - Delete a user and their stats
async function handleDeleteUser(env, body) {
    try {
        const { username } = body;
        
        if (!username) {
            return new Response(
                JSON.stringify({ error: 'Username required' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        // Get user ID first
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(
                JSON.stringify({ error: 'User not found' }), 
                { status: 404, headers: getSecureCorsHeaders() }
            );
        }

        // Delete stats
        await env.DB.prepare(
            'DELETE FROM stats WHERE user_id = ?'
        ).bind(userResult.id).run();

        // Delete user
        await env.DB.prepare(
            'DELETE FROM users WHERE id = ?'
        ).bind(userResult.id).run();

        return new Response(
            JSON.stringify({ success: true, message: `User "${username}" deleted` }), 
            { headers: getSecureCorsHeaders() }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}

// POST /api/admin/wipe-data - Delete all users and stats
async function handleWipeData(env) {
    try {
        // Delete all stats first (due to foreign key)
        await env.DB.prepare('DELETE FROM stats').run();

        // Delete all users
        await env.DB.prepare('DELETE FROM users').run();

        return new Response(
            JSON.stringify({ success: true, message: 'All data wiped' }), 
            { headers: getSecureCorsHeaders() }
        );
    } catch (error) {
        console.error('Error wiping data:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}

// POST /api/admin/update-user-stats - Update a user's stats
async function handleUpdateUserStats(env, body) {
    try {
        const { username, stats } = body;
        
        if (!username || !stats) {
            return new Response(
                JSON.stringify({ error: 'Username and stats required' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        // Get user ID
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(
                JSON.stringify({ error: 'User not found' }), 
                { status: 404, headers: getSecureCorsHeaders() }
            );
        }

        const userId = userResult.id;

        // Update stats
        const updateFields = [];
        const values = [];

        if (stats.wins !== undefined) { updateFields.push('wins = ?'); values.push(stats.wins); }
        if (stats.games_played !== undefined) { updateFields.push('games_played = ?'); values.push(stats.games_played); }
        if (stats.total_guesses !== undefined) { updateFields.push('total_guesses = ?'); values.push(stats.total_guesses); }
        if (stats.total_time_seconds !== undefined) { updateFields.push('total_time_seconds = ?'); values.push(stats.total_time_seconds); }
        if (stats.daily_streak !== undefined) { updateFields.push('daily_streak = ?'); values.push(stats.daily_streak); }
        if (stats.daily_max_streak !== undefined) { updateFields.push('daily_max_streak = ?'); values.push(stats.daily_max_streak); }
        if (stats.random_streak !== undefined) { updateFields.push('random_streak = ?'); values.push(stats.random_streak); }
        if (stats.random_max_streak !== undefined) { updateFields.push('random_max_streak = ?'); values.push(stats.random_max_streak); }
        if (stats.streak_days !== undefined) { updateFields.push('streak_days = ?'); values.push(stats.streak_days); }
        if (stats.max_streak !== undefined) { updateFields.push('max_streak = ?'); values.push(stats.max_streak); }
        if (stats.daily_plays !== undefined) { updateFields.push('daily_plays = ?'); values.push(stats.daily_plays); }
        if (stats.daily_wins !== undefined) { updateFields.push('daily_wins = ?'); values.push(stats.daily_wins); }
        if (stats.daily_losses !== undefined) { updateFields.push('daily_losses = ?'); values.push(stats.daily_losses); }
        if (stats.daily_guesses !== undefined) { updateFields.push('daily_guesses = ?'); values.push(stats.daily_guesses); }
        if (stats.daily_time !== undefined) { updateFields.push('daily_time = ?'); values.push(stats.daily_time); }
        if (stats.random_plays !== undefined) { updateFields.push('random_plays = ?'); values.push(stats.random_plays); }
        if (stats.random_wins !== undefined) { updateFields.push('random_wins = ?'); values.push(stats.random_wins); }
        if (stats.random_losses !== undefined) { updateFields.push('random_losses = ?'); values.push(stats.random_losses); }
        if (stats.random_guesses !== undefined) { updateFields.push('random_guesses = ?'); values.push(stats.random_guesses); }
        if (stats.random_time !== undefined) { updateFields.push('random_time = ?'); values.push(stats.random_time); }
        if (stats.total_plays !== undefined) { updateFields.push('total_plays = ?'); values.push(stats.total_plays); }
        if (stats.total_wins !== undefined) { updateFields.push('total_wins = ?'); values.push(stats.total_wins); }
        if (stats.total_losses !== undefined) { updateFields.push('total_losses = ?'); values.push(stats.total_losses); }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        const query = `UPDATE stats SET ${updateFields.join(', ')} WHERE user_id = ?`;
        await env.DB.prepare(query).bind(...values).run();

        return new Response(
            JSON.stringify({ success: true, message: 'Stats updated' }), 
            { headers: getSecureCorsHeaders() }
        );
    } catch (error) {
        console.error('Error updating stats:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}
