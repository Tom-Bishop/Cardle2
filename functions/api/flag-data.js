function isoNow() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json().catch(() => null);
        if (!body) {
            return new Response("Bad JSON", { status: 400, headers: corsHeaders });
        }

        const {
            carId,
            currentMake,
            currentModel,
            currentBody,
            currentOrigin,
            currentPower,
            currentSegment,
            suggestedMake,
            suggestedModel,
            suggestedBody,
            suggestedOrigin,
            suggestedPower,
            suggestedSegment,
            notes,
            username,
            timestamp,
            gameMode
        } = body;

        // Validate required fields
        if (!carId || !username) {
            return new Response("Missing required fields", { status: 400, headers: corsHeaders });
        }

        // Create flagged_data table if not exists
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS flagged_data (
                id TEXT PRIMARY KEY,
                car_id INTEGER NOT NULL,
                current_make TEXT,
                current_model TEXT,
                current_body TEXT,
                current_origin TEXT,
                current_power TEXT,
                current_segment TEXT,
                suggested_make TEXT,
                suggested_model TEXT,
                suggested_body TEXT,
                suggested_origin TEXT,
                suggested_power TEXT,
                suggested_segment TEXT,
                notes TEXT,
                username TEXT,
                game_mode TEXT,
                status TEXT DEFAULT 'pending',
                reviewed_by TEXT,
                reviewed_at TEXT,
                created_at TEXT,
                FOREIGN KEY (car_id) REFERENCES cars(id)
            )
        `).run();

        // Insert the flag report
        const flagId = uuid();
        const now = isoNow();

        await env.DB.prepare(`
            INSERT INTO flagged_data (
                id, car_id,
                current_make, current_model, current_body, current_origin, current_power, current_segment,
                suggested_make, suggested_model, suggested_body, suggested_origin, suggested_power, suggested_segment,
                notes, username, game_mode, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            flagId, carId,
            currentMake, currentModel, currentBody, currentOrigin, currentPower, currentSegment,
            suggestedMake, suggestedModel, suggestedBody, suggestedOrigin, suggestedPower, suggestedSegment,
            notes, username, gameMode, 'pending', now
        ).run();

        return new Response(JSON.stringify({ 
            ok: true, 
            flagId,
            message: 'Flag report submitted successfully' 
        }), { 
            status: 200, 
            headers: corsHeaders 
        });

    } catch (err) {
        console.error('Error in flag-data endpoint:', err);
        return new Response(JSON.stringify({ 
            ok: false, 
            error: err.message 
        }), { 
            status: 500, 
            headers: corsHeaders 
        });
    }
}
