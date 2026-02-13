// POST /api/admin/delete-user - Delete a user and their stats

import { verifyAdminAuth, getSecureCorsHeaders } from '../_admin-auth.js';

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: getSecureCorsHeaders() });
    }

    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { status: 405, headers: getSecureCorsHeaders() }
        );
    }

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request, env);
    if (!authResult.authorized) {
        return new Response(
            JSON.stringify({ error: authResult.error }), 
            { status: authResult.status, headers: getSecureCorsHeaders() }
        );
    }

    let body = {};
    try {
        body = await request.json();
    } catch (e) {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON' }), 
            { status: 400, headers: getSecureCorsHeaders() }
        );
    }

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
