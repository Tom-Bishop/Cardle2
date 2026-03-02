// Admin endpoint to view and manage flagged car data reports

import { verifyAdminAuth, getSecureCorsHeaders } from '../_admin-auth.js';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

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

    // Handle GET - fetch flagged data reports
    if (request.method === 'GET') {
        try {
            const status = url.searchParams.get('status') || 'pending';
            
            let query = `
                SELECT 
                    fd.*,
                    c.make as car_make,
                    c.model as car_model
                FROM flagged_data fd
                LEFT JOIN cars c ON fd.car_id = c.id
            `;

            const params = [];
            if (status !== 'all') {
                query += ` WHERE fd.status = ?`;
                params.push(status);
            }

            query += ` ORDER BY fd.created_at DESC`;

            const stmt = params.length > 0 
                ? env.DB.prepare(query).bind(...params)
                : env.DB.prepare(query);

            const result = await stmt.all();

            return new Response(
                JSON.stringify({ 
                    ok: true, 
                    flags: result.results || [] 
                }), 
                { status: 200, headers: getSecureCorsHeaders() }
            );

        } catch (err) {
            console.error('Error fetching flagged data:', err);
            return new Response(
                JSON.stringify({ ok: false, error: err.message }), 
                { status: 500, headers: getSecureCorsHeaders() }
            );
        }
    }

    // Handle PATCH - update flag status (approve/reject)
    if (request.method === 'PATCH') {
        try {
            const body = await request.json().catch(() => null);
            if (!body || !body.flagId || !body.status) {
                return new Response(
                    JSON.stringify({ error: 'Missing flagId or status' }), 
                    { status: 400, headers: getSecureCorsHeaders() }
                );
            }

            const { flagId, status, applyChanges } = body;
            const reviewedBy = authResult.username;
            const reviewedAt = new Date().toISOString();

            // Update flag status
            await env.DB.prepare(`
                UPDATE flagged_data 
                SET status = ?, reviewed_by = ?, reviewed_at = ?
                WHERE id = ?
            `).bind(status, reviewedBy, reviewedAt, flagId).run();

            // If approved and applyChanges is true, update the car data
            if (status === 'approved' && applyChanges) {
                const flag = await env.DB.prepare(`
                    SELECT * FROM flagged_data WHERE id = ?
                `).bind(flagId).first();

                if (flag) {
                    const updates = [];
                    const params = [];

                    if (flag.suggested_make && flag.suggested_make !== flag.current_make) {
                        updates.push('make = ?');
                        params.push(flag.suggested_make);
                    }
                    if (flag.suggested_model && flag.suggested_model !== flag.current_model) {
                        updates.push('model = ?');
                        params.push(flag.suggested_model);
                    }
                    if (flag.suggested_body && flag.suggested_body !== flag.current_body) {
                        updates.push('body = ?');
                        params.push(flag.suggested_body);
                    }
                    if (flag.suggested_origin && flag.suggested_origin !== flag.current_origin) {
                        updates.push('origin = ?');
                        params.push(flag.suggested_origin);
                    }
                    if (flag.suggested_power && flag.suggested_power !== flag.current_power) {
                        updates.push('power = ?');
                        params.push(flag.suggested_power);
                    }
                    if (flag.suggested_segment && flag.suggested_segment !== flag.current_segment) {
                        updates.push('segment = ?');
                        params.push(flag.suggested_segment);
                    }

                    if (updates.length > 0) {
                        params.push(flag.car_id);
                        await env.DB.prepare(`
                            UPDATE cars 
                            SET ${updates.join(', ')}
                            WHERE id = ?
                        `).bind(...params).run();
                    }
                }
            }

            return new Response(
                JSON.stringify({ 
                    ok: true, 
                    message: 'Flag status updated successfully' 
                }), 
                { status: 200, headers: getSecureCorsHeaders() }
            );

        } catch (err) {
            console.error('Error updating flag status:', err);
            return new Response(
                JSON.stringify({ ok: false, error: err.message }), 
                { status: 500, headers: getSecureCorsHeaders() }
            );
        }
    }

    return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { status: 405, headers: getSecureCorsHeaders() }
    );
}
