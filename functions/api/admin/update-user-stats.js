// POST /api/admin/update-user-stats - Update a user's stats

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    let body = {};
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    // Verify admin (must be Tom)
    const adminUsername = body.adminUsername;
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

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
