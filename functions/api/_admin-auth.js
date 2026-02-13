// Shared admin authentication utility
// This file provides secure admin authentication for all admin endpoints

const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://cardle.jogn.co.uk',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
};

// PBKDF2 password hashing (same as auth.js for consistency)
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

/**
 * Verify admin credentials from request
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment bindings
 * @returns {Promise<Object>} { authorized: boolean, error?: string }
 */
export async function verifyAdminAuth(request, env) {
    try {
        // Get credentials from Authorization header or request body
        const authHeader = request.headers.get('Authorization');
        let username, password;

        if (authHeader && authHeader.startsWith('Basic ')) {
            // Parse Basic Auth header
            const base64Credentials = authHeader.slice(6);
            const credentials = atob(base64Credentials);
            const parts = credentials.split(':');
            username = parts[0];
            password = parts.slice(1).join(':'); // In case password contains ':'
        } else {
            // Try to get from request body
            const contentType = request.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const body = await request.clone().json().catch(() => ({}));
                username = body.adminUsername || body.username;
                password = body.adminPassword || body.password;
            }
        }

        if (!username || !password) {
            return { 
                authorized: false, 
                error: 'Missing admin credentials',
                status: 401 
            };
        }

        // Check if user exists and is an admin
        const user = await env.DB.prepare(`
            SELECT id, username, password_hash, is_admin 
            FROM users 
            WHERE username = ? AND is_admin = 1
        `).bind(username).first();

        if (!user) {
            // Add delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 100));
            return { 
                authorized: false, 
                error: 'Invalid admin credentials',
                status: 403 
            };
        }

        // Verify password
        const passwordHash = await hashPassword(password);
        if (passwordHash !== user.password_hash) {
            // Add delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 100));
            return { 
                authorized: false, 
                error: 'Invalid admin credentials',
                status: 403 
            };
        }

        return { 
            authorized: true, 
            username: user.username,
            userId: user.id 
        };

    } catch (error) {
        console.error('Admin auth error:', error);
        return { 
            authorized: false, 
            error: 'Authentication error',
            status: 500 
        };
    }
}

/**
 * Get secure CORS headers (restrict to same origin only for admin endpoints)
 */
export function getSecureCorsHeaders(allowedOrigin = 'https://cardle.jogn.co.uk') {
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
}

export { corsHeaders };
