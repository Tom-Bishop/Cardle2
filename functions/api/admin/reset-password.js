import { verifyAdminAuth, getSecureCorsHeaders } from '../_admin-auth.js';

// PBKDF2 password hashing for consistency with auth.js
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const salt = encoder.encode('cardle2-salt-v1');
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: getSecureCorsHeaders() });
    }

    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { status: 405, headers: getSecureCorsHeaders() }
        );
    }

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request, env);
    if (!authResult.authorized) {
        return new Response(
            JSON.stringify({ error: authResult.error }), 
            { status: authResult.status, headers: getSecureCorsHeaders() }
        );
    }

    try {
        const body = await request.json().catch(() => null);
        if (!body) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        const { username, newPassword } = body;
        
        if (!username || !newPassword) {
            return new Response(
                JSON.stringify({ error: 'Username and newPassword required' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        if (newPassword.length < 8) {
            return new Response(
                JSON.stringify({ error: 'Password must be at least 8 characters' }), 
                { status: 400, headers: getSecureCorsHeaders() }
            );
        }

        const hash = await hashPassword(newPassword);

        // Get user ID
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(
                JSON.stringify({ error: 'User not found' }), 
                { status: 404, headers: getSecureCorsHeaders() }
            );
        }

        // Update password
        await env.DB.prepare(
            'UPDATE users SET password_hash = ? WHERE id = ?'
        ).bind(hash, userResult.id).run();

        return new Response(
            JSON.stringify({ success: true, message: `Password reset for ${username}` }), 
            { headers: getSecureCorsHeaders() }
        );
    } catch (error) {
        console.error('Error resetting password:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { status: 500, headers: getSecureCorsHeaders() }
        );
    }
}
