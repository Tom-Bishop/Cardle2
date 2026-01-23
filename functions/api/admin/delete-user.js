// POST /api/admin/delete-user - Delete a user and their stats

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    let body = {};
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
    }

    // Verify admin (must be Tom)
    const adminUsername = body.adminUsername;
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
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
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
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
            headers: corsHeaders
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}
