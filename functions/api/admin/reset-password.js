async function sha256Hex(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // Verify admin (must be Tom)
    const adminUsername = url.searchParams.get('username');
    if (adminUsername !== 'Tom') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    try {
        const body = await request.json().catch(() => null);
        if (!body) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }

        const { username, newPassword } = body;
        
        if (!username || !newPassword) {
            return new Response(JSON.stringify({ error: 'Username and newPassword required' }), { status: 400 });
        }

        if (newPassword.length < 4) {
            return new Response(JSON.stringify({ error: 'Password must be at least 4 characters' }), { status: 400 });
        }

        const hash = await sha256Hex(newPassword);

        // Get user ID
        const userResult = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        if (!userResult) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Update password
        await env.DB.prepare(
            'UPDATE users SET password_hash = ? WHERE id = ?'
        ).bind(hash, userResult.id).run();

        return new Response(JSON.stringify({ success: true, message: `Password reset for ${username}` }), { 
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
