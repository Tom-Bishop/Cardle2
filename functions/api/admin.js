export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Parse request body
    let body = {};
    if (request.method !== 'GET') {
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
    }

    // Verify admin (must be Tom) - check both body and query params
    const adminUsername = body.adminUsername || body.username || url.searchParams.get('username');
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
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
            return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}

// GET /api/admin/users - List all users with stats
async function handleGetUsers(env, url) {
    try {
        const targetUser = url.searchParams.get('targetUser');
        
        let query = `
            SELECT 
                u.id, u.username, u.created_at,
                s.wins, s.games_played, s.total_guesses, s.total_time_seconds,
                s.daily_won, s.daily_played, s.daily_streak, s.daily_max_streak,
                s.random_won, s.random_played, s.random_streak, s.random_max_streak,
                s.streak_days, s.max_streak, s.last_daily_play
            FROM users u
            LEFT JOIN stats s ON u.id = s.user_id
        `;

        if (targetUser) {
            query += ` WHERE u.username = ?`;
            const result = await env.DB.prepare(query).bind(targetUser).all();
            return new Response(JSON.stringify(result.results || []), { 
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const result = await env.DB.prepare(query).all();
            return new Response(JSON.stringify(result.results || []), { 
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// POST /api/admin/delete-user - Delete a user and their stats
async function handleDeleteUser(env, body) {
    try {
        const { username } = body;
        
        if (!username) {
            return new Response(JSON.stringify({ error: 'Username required' }), { status: 400 });
        }

        // Get user ID first
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Delete stats
        await env.DB.prepare(
            'DELETE FROM stats WHERE user_id = ?'
        ).bind(userResult.id).run();

        // Delete user
        await env.DB.prepare(
            'DELETE FROM users WHERE id = ?'
        ).bind(userResult.id).run();

        return new Response(JSON.stringify({ success: true, message: `User "${username}" deleted` }), { 
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// POST /api/admin/wipe-data - Delete all users and stats
async function handleWipeData(env) {
    try {
        // Delete all stats first (due to foreign key)
        await env.DB.prepare('DELETE FROM stats').run();

        // Delete all users
        await env.DB.prepare('DELETE FROM users').run();

        return new Response(JSON.stringify({ success: true, message: 'All data wiped' }), { 
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error wiping data:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// POST /api/admin/update-user-stats - Update a user's stats
async function handleUpdateUserStats(env, body) {
    try {
        const { username, stats } = body;
        
        if (!username || !stats) {
            return new Response(JSON.stringify({ error: 'Username and stats required' }), { status: 400 });
        }

        // Get user ID
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const userId = userResult.id;

        // Update stats
        const updateFields = [];
        const values = [];

        if (stats.wins !== undefined) { updateFields.push('wins = ?'); values.push(stats.wins); }
        if (stats.games_played !== undefined) { updateFields.push('games_played = ?'); values.push(stats.games_played); }
        if (stats.total_guesses !== undefined) { updateFields.push('total_guesses = ?'); values.push(stats.total_guesses); }
        if (stats.total_time_seconds !== undefined) { updateFields.push('total_time_seconds = ?'); values.push(stats.total_time_seconds); }
        if (stats.daily_won !== undefined) { updateFields.push('daily_won = ?'); values.push(stats.daily_won); }
        if (stats.daily_played !== undefined) { updateFields.push('daily_played = ?'); values.push(stats.daily_played); }
        if (stats.daily_streak !== undefined) { updateFields.push('daily_streak = ?'); values.push(stats.daily_streak); }
        if (stats.daily_max_streak !== undefined) { updateFields.push('daily_max_streak = ?'); values.push(stats.daily_max_streak); }
        if (stats.random_won !== undefined) { updateFields.push('random_won = ?'); values.push(stats.random_won); }
        if (stats.random_played !== undefined) { updateFields.push('random_played = ?'); values.push(stats.random_played); }
        if (stats.random_streak !== undefined) { updateFields.push('random_streak = ?'); values.push(stats.random_streak); }
        if (stats.random_max_streak !== undefined) { updateFields.push('random_max_streak = ?'); values.push(stats.random_max_streak); }
        if (stats.streak_days !== undefined) { updateFields.push('streak_days = ?'); values.push(stats.streak_days); }
        if (stats.max_streak !== undefined) { updateFields.push('max_streak = ?'); values.push(stats.max_streak); }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        const query = `UPDATE stats SET ${updateFields.join(', ')} WHERE user_id = ?`;
        await env.DB.prepare(query).bind(...values).run();

        return new Response(JSON.stringify({ success: true, message: 'Stats updated' }), { 
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
