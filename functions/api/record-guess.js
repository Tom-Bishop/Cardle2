// POST /api/record-guess - Record a guess in the guess_history table

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await request.json();
        const { username, carId, carMake, carModel } = body;

        // Validate inputs
        if (!username || !carId || !carMake || !carModel) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const DB = env.DB;

        // Insert the guess record
        const query = `
            INSERT INTO guess_history (username, car_id, car_make, car_model)
            VALUES (?, ?, ?, ?)
        `;

        const result = await DB.prepare(query).bind(username, carId, carMake, carModel).run();

        return new Response(JSON.stringify({
            ok: true,
            message: 'Guess recorded',
            id: result.meta.last_row_id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Record guess error:', err);
        return new Response(JSON.stringify({ 
            error: err.message || 'Internal server error',
            ok: false
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
