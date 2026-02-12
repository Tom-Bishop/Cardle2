// DELETE /api/admin/delete-guesses - Delete all guess history data
// Admin-only endpoint (Tom only)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Verify admin (must be Tom)
    const adminUsername = url.searchParams.get('username');
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
    }

    if (request.method !== 'DELETE') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
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
            headers: corsHeaders 
        });

    } catch (error) {
        console.error('Error deleting guess history:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete guess history', 
            details: error.message 
        }), { 
            status: 500, 
            headers: corsHeaders 
        });
    }
}
