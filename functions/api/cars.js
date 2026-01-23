// GET /api/cars - Fetch all cars for the game

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const db = env.DB;
        const cars = await db.prepare('SELECT id, make, model, body, origin, power, segment FROM cars ORDER BY id').all();
        
        return new Response(JSON.stringify(cars.results || []), {
            status: 200,
            headers: corsHeaders
        });
    } catch (e) {
        console.error('Database error:', e);
        return new Response(JSON.stringify({ error: 'Failed to fetch cars: ' + e.message }), { status: 500, headers: corsHeaders });
    }
}
