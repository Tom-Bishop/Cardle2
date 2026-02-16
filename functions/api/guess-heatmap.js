// API endpoint for guess pattern heatmap analytics

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const typeParam = url.searchParams.get('type') || 'make'; // make, body, origin, power, segment
        const username = url.searchParams.get('username'); // optional: filter by user

        const allowedTypes = ['make', 'model', 'body', 'origin', 'power', 'segment'];
        const type = allowedTypes.includes(typeParam) ? typeParam : 'make';

        const usesGuessHistory = type === 'make' || type === 'model';
        const valueExpr = usesGuessHistory
            ? (type === 'make' ? 'gh.car_make' : 'gh.car_model')
            : `c.${type}`;
        const joinClause = usesGuessHistory ? '' : 'JOIN cars c ON gh.car_id = c.id';

        // Get guess statistics grouped by the requested type
        let query = `
            SELECT 
                ${valueExpr} as value,
                COUNT(*) as count
            FROM guess_history gh
            ${joinClause}
        `;

        const params = [];
        const whereClauses = [];
        if (username) {
            whereClauses.push('gh.username = ?');
            params.push(username);
        }
        if (!usesGuessHistory) {
            whereClauses.push(`${valueExpr} IS NOT NULL`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ` GROUP BY ${valueExpr} ORDER BY count DESC LIMIT 50`;

        const stmt = params.length > 0 
            ? env.DB.prepare(query).bind(...params)
            : env.DB.prepare(query);

        const result = await stmt.all();
        const data = result.results || [];

        // Calculate max count for normalization
        const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 1;

        // Normalize values to 0-1 range for heatmap
        const normalized = data.map(item => ({
            value: item.value,
            count: item.count,
            intensity: item.count / maxCount
        }));

        // Also get overall stats
        const totalGuesses = await env.DB.prepare(`
            SELECT COUNT(*) as total FROM guess_history gh
            ${username ? 'WHERE gh.username = ?' : ''}
        `).bind(...(username ? [username] : [])).first();

        // Get most common guess combinations
        const comboQuery = `
            SELECT 
                gh.car_make || ' ' || gh.car_model as car,
                COUNT(*) as count
            FROM guess_history gh
            ${username ? 'WHERE gh.username = ?' : ''}
            GROUP BY gh.car_make, gh.car_model
            ORDER BY count DESC
            LIMIT 20
        `;

        const comboStmt = username 
            ? env.DB.prepare(comboQuery).bind(username)
            : env.DB.prepare(comboQuery);

        const comboResult = await comboStmt.all();

        return new Response(
            JSON.stringify({
                ok: true,
                data: normalized,
                combinations: comboResult.results || [],
                totalGuesses: totalGuesses?.total || 0,
                type
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (err) {
        console.error('Error in guess-heatmap endpoint:', err);
        return new Response(
            JSON.stringify({ 
                ok: false, 
                error: err.message 
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}
