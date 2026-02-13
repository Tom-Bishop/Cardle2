// Shared utility for public API endpoints
// Provides consistent security headers and CORS configuration

/**
 * Get CORS headers for public API endpoints
 * These endpoints can be called from anywhere but should have security headers
 * @param {string} origin - Optional specific origin to allow
 * @returns {Object} Headers object
 */
export function getPublicApiHeaders(origin = null) {
    // If origin is provided and matches our domain, allow credentials
    const allowedOrigins = [
        'https://cardle.jogn.co.uk',
        'http://localhost:8788', // For development
        'http://127.0.0.1:8788'
    ];
    
    const corsOrigin = (origin && allowedOrigins.includes(origin)) ? origin : '*';
    const allowCredentials = corsOrigin !== '*';
    
    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
        'Content-Type': 'application/json',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    
    if (allowCredentials) {
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return headers;
}

/**
 * Get secure headers for authentication endpoints
 * @returns {Object} Headers object
 */
export function getAuthApiHeaders() {
    return {
        'Access-Control-Allow-Origin': 'https://cardle.jogn.co.uk',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'"
    };
}

/**
 * Validate CSRF token from request
 * @param {Request} request - The incoming request
 * @param {string} expectedToken - Expected CSRF token value
 * @returns {boolean} Whether token is valid
 */
export function validateCsrfToken(request, expectedToken = 'cardle-csrf-protection') {
    const csrfToken = request.headers.get('X-CSRF-Token');
    return csrfToken === expectedToken;
}

/**
 * Rate limiting check (basic implementation)
 * For production, use KV store or Durable Objects
 * @param {Request} request
 * @param {Object} env - Environment bindings
 * @param {string} key - Rate limit key (e.g., 'auth', 'submit')
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<Object>} { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(request, env, key, maxAttempts = 5, windowMs = 3600000) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitKey = `rate-limit:${key}:${ip}`;
    
    try {
        if (env.RATE_LIMIT_KV) {
            const current = await env.RATE_LIMIT_KV.get(rateLimitKey, 'json') || { 
                count: 0, 
                resetTime: Date.now() + windowMs 
            };
            
            if (Date.now() > current.resetTime) {
                // Reset counter after time window
                current.count = 0;
                current.resetTime = Date.now() + windowMs;
            }
            
            current.count++;
            
            if (current.count > maxAttempts) {
                return { 
                    allowed: false, 
                    remaining: 0,
                    resetTime: current.resetTime 
                };
            }
            
            await env.RATE_LIMIT_KV.put(rateLimitKey, JSON.stringify(current), {
                expirationTtl: Math.ceil(windowMs / 1000)
            });
            
            return { 
                allowed: true, 
                remaining: maxAttempts - current.count 
            };
        }
    } catch (e) {
        console.warn('Rate limit check failed:', e);
    }
    
    // If rate limiting fails, allow the request (fail open)
    return { allowed: true, remaining: maxAttempts };
}
