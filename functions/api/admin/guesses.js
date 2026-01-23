// GET /api/admin/guesses - Get most guessed cars statistics
// Admin-only endpoint (Tom only)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const DB = env.DB;
        
        const mode = url.searchParams.get('mode') || 'global'; // 'global' or specific username
        const limit = parseInt(url.searchParams.get('limit') || '30');
        
        if (mode === 'global') {
            // Get most guessed cars across all users
            const query = `
                SELECT 
                    gh.car_id,
                    gh.car_make,
                    gh.car_model,
                    COUNT(*) as total_guesses,
                    COUNT(DISTINCT gh.username) as unique_guessers
                FROM guess_history gh
                GROUP BY gh.car_id, gh.car_make, gh.car_model
                ORDER BY total_guesses DESC
                LIMIT ?
            `;
            
            const results = await DB.prepare(query).bind(limit).all();
            
            return new Response(JSON.stringify({
                ok: true,
                mode: 'global',
                data: results.results || []
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Get most guessed cars by a specific user
            const username = url.searchParams.get('user');
            if (!username) {
                return new Response(JSON.stringify({ error: 'Missing user parameter' }), { status: 400 });
            }
            
            const query = `
                SELECT 
                    gh.car_id,
                    gh.car_make,
                    gh.car_model,
                    COUNT(*) as guess_count,
                    MAX(gh.guessed_at) as last_guessed
                FROM guess_history gh
                WHERE gh.username = ?
                GROUP BY gh.car_id, gh.car_make, gh.car_model
                ORDER BY guess_count DESC
                LIMIT ?
            `;
            
            const results = await DB.prepare(query).bind(username, limit).all();
            
            return new Response(JSON.stringify({
                ok: true,
                mode: 'user',
                username: username,
                data: results.results || []
            }), {
                status: 200,
                headers: corsHeaders
            });
        }
    } catch (err) {
        console.error('Admin guesses error:', err);
        return new Response(JSON.stringify({ 
            error: err.message || 'Internal server error',
            ok: false
        }), { 
            status: 500,
            headers: corsHeaders
        });
    }
}
