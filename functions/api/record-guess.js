// POST /api/record-guess - Record a guess in the guess_history table

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

function getCookie(request, name) {
    const cookie = request.headers.get('Cookie');
    if (!cookie) return null;
    const parts = cookie.split(';').map(p => p.trim());
    for (const part of parts) {
        if (part.startsWith(name + '=')) {
            return decodeURIComponent(part.slice(name.length + 1));
        }
    }
    return null;
}

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const { username, carId, carMake, carModel, guessNumber } = body;

        const cookieUser = getCookie(request, 'cardleUsername');
        if (!cookieUser || cookieUser !== username) {
            return new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401, headers: corsHeaders });
        }

        // Validate inputs
        if (!username || username.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid username' }), { status: 400, headers: corsHeaders });
        }
        
        if (!Number.isInteger(carId) || carId <= 0) {
            return new Response(JSON.stringify({ error: 'Invalid carId' }), { status: 400, headers: corsHeaders });
        }
        
        if (!carMake || !carModel || carMake.trim().length === 0 || carModel.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid car make or model' }), { status: 400, headers: corsHeaders });
        }

        let guessNumValue = null;
        if (guessNumber !== undefined) {
            if (!Number.isInteger(guessNumber) || guessNumber < 1 || guessNumber > 5) {
                return new Response(JSON.stringify({ error: 'Invalid guess number' }), { status: 400, headers: corsHeaders });
            }
            guessNumValue = guessNumber;
        }

        const DB = env.DB;
        
        // Verify car exists in database
        const car = await DB.prepare('SELECT id FROM cars WHERE id = ?').bind(carId).first();
        if (!car) {
            return new Response(JSON.stringify({ error: 'Car not found' }), { status: 400, headers: corsHeaders });
        }

        // Insert the guess record
        const query = `
            INSERT INTO guess_history (username, car_id, car_make, car_model, guess_number)
            VALUES (?, ?, ?, ?, ?)
        `;

        const result = await DB.prepare(query).bind(username, carId, carMake, carModel, guessNumValue).run();

        return new Response(JSON.stringify({
            ok: true,
            message: 'Guess recorded',
            id: result.meta.last_row_id
        }), {
            status: 200,
            headers: corsHeaders
        });
    } catch (err) {
        console.error('Record guess error:', err);
        return new Response(JSON.stringify({ 
            error: err.message || 'Internal server error',
            ok: false
        }), { 
            status: 500,
            headers: corsHeaders
        });
    }
}
