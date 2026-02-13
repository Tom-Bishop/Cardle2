// DELETE /api/admin/delete-guesses - Delete all guess history data
// Admin-only endpoint

import { verifyAdminAuth, getSecureCorsHeaders } from '../_admin-auth.js';

export async function onRequest(context) {
    const { request, env } = context;

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

    if (request.method !== 'DELETE') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { status: 405, headers: getSecureCorsHeaders() }
        );
    }

    try {
        const DB = env.DB;

        // Get count before deletion
        const countResult = await DB.prepare('SELECT COUNT(*) as count FROM guess_history').first();
        const deletedCount = countResult.count;

        // Delete all guess history
        await DB.prepare('DELETE FROM guess_history').run();

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Deleted ${deletedCount} guess history records`,
            deletedCount 
        }), { 
            status: 200, 
            headers: getSecureCorsHeaders() 
        });

    } catch (error) {
        console.error('Error deleting guess history:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete guess history', 
            details: error.message 
        }), { 
            status: 500, 
            headers: getSecureCorsHeaders() 
        });
    }
}
