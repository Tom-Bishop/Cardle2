// GET /api/cars - Fetch all cars for the game

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const db = env.DB;
        const cars = await db.prepare('SELECT id, make, model, body, origin, power FROM cars').all();
        
        return new Response(JSON.stringify(cars.results || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('Database error:', e);
        return new Response(JSON.stringify({ error: 'Failed to fetch cars: ' + e.message }), { status: 500 });
    }
}
