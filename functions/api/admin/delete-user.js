// POST /api/admin/delete-user - Delete a user and their stats

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
