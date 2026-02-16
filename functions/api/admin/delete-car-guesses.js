// Admin endpoint to delete guess history for a specific car ID

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

    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: getSecureCorsHeaders() }
        );
    }

    try {
        const body = await request.json().catch(() => null);
        const carId = Number(body?.carId || 0);

        if (!Number.isInteger(carId) || carId <= 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid carId' }),
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        // Ensure car exists
        const car = await env.DB.prepare('SELECT id FROM cars WHERE id = ?').bind(carId).first();
        if (!car) {
            return new Response(
                JSON.stringify({ error: 'Car not found' }),
                { status: 404, headers: getSecureCorsHeaders() }
            );
        }

        const result = await env.DB.prepare('DELETE FROM guess_history WHERE car_id = ?').bind(carId).run();
        const deleted = result?.meta?.changes || 0;

        return new Response(
            JSON.stringify({ ok: true, deleted }),
            { status: 200, headers: getSecureCorsHeaders() }
        );
    } catch (err) {
        console.error('Error deleting car guesses:', err);
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}
