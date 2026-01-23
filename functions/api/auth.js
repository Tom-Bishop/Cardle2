// PBKDF2 password hashing for better security than plain SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = encoder.encode('cardle2-salt-v1'); // Fixed salt (consider making this per-user in future)
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
      iterations: 100000, // NIST recommendation
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Legacy SHA-256 hashing (for migration only)
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function setCookieHeader(username) {
  return `cardleUsername=${encodeURIComponent(username)}; Path=/; SameSite=Strict; Secure; Max-Age=31536000`;
}

// Rate limiting: max 5 auth attempts per IP per hour
async function checkRateLimit(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `rate-limit:auth:${ip}`;
  
  try {
    // Try to use KV for rate limiting if available
    if (env.RATE_LIMIT_KV) {
      const current = await env.RATE_LIMIT_KV.get(key, 'json') || { count: 0, resetTime: Date.now() + 3600000 };
      
      if (Date.now() > current.resetTime) {
        // Reset counter after 1 hour
        current.count = 0;
        current.resetTime = Date.now() + 3600000;
      }
      
      current.count++;
      
      if (current.count > 5) {
        return { allowed: false, message: 'Too many login attempts. Try again in 1 hour.' };
      }
      
      await env.RATE_LIMIT_KV.put(key, JSON.stringify(current));
      return { allowed: true };
    }
  } catch (e) {
    // Silently fail rate limiting if KV not available - don't block the user
    console.warn('Rate limit check failed:', e);
  }
  
  return { allowed: true };
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
    'Content-Type': 'application/json'
};

export async function onRequestPost({ request, env }) {
  // CSRF token validation
  const csrfToken = request.headers.get('X-CSRF-Token');
  if (csrfToken !== 'cardle-csrf-protection') {
    return new Response(JSON.stringify({ ok: false, error: 'csrf_failed' }), { status: 403, headers: corsHeaders });
  }

  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ ok: false, error: 'bad_json' }), { status: 400, headers: corsHeaders });

  const action = String(body.action || '').trim(); // 'register', 'login', or 'change_password'
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  // Rate limit login/register attempts
  if (action === 'login' || action === 'register') {
    const rateLimit = await checkRateLimit(request, env);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ ok: false, error: 'rate_limited', message: rateLimit.message }), { status: 429, headers: corsHeaders });
    }
  }

  if (!username || username.length > 24) return new Response(JSON.stringify({ ok: false, error: 'bad_username' }), { status: 400, headers: corsHeaders });
  
  // Validate username format (alphanumeric, hyphen, underscore only)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return new Response(JSON.stringify({ ok: false, error: 'invalid_username_format' }), { status: 400, headers: corsHeaders });

  // Only check password field for register/login actions
  if ((action === 'register' || action === 'login') && !password) return new Response(JSON.stringify({ ok: false, error: 'bad_password' }), { status: 400, headers: corsHeaders });

  // Validate password length on register
  if (action === 'register' && password.length < 8) return new Response(JSON.stringify({ ok: false, error: 'password_too_short' }), { status: 400, headers: corsHeaders });

  const now = new Date().toISOString();

  if (action === 'register') {
    // check existing
    const exists = await env.DB.prepare(`SELECT id FROM users WHERE username = ?`).bind(username).first();
    if (exists?.id) return new Response(JSON.stringify({ ok: false, error: 'username_taken' }), { status: 409, headers: corsHeaders });

    const id = crypto.randomUUID();
    const hash = await hashPassword(password);
    await env.DB.prepare(`INSERT INTO users (id, username, created_at, password_hash) VALUES (?, ?, ?, ?)`)
      .bind(id, username, now, hash).run();

    await env.DB.prepare(`INSERT INTO stats (user_id, xp, level, streak_days, wins, games_played, total_guesses, total_time_seconds, updated_at) VALUES (?, 0, 1, 0, 0, 0, 0, 0, ?)`)
      .bind(id, now).run();

    // set cookie
    const headers = new Headers(corsHeaders);
    headers.append('Set-Cookie', setCookieHeader(username));
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  if (action === 'login') {
    const row = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE username = ?`).bind(username).first();
    if (!row?.id) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: corsHeaders });
    
    // Try PBKDF2 hash first (new method)
    const pbkdf2Hash = await hashPassword(password);
    let isValid = pbkdf2Hash === row.password_hash;
    let needsMigration = false;
    
    // If PBKDF2 fails, try legacy SHA-256 (migration support)
    if (!isValid) {
      const legacyHash = await sha256Hex(password);
      isValid = legacyHash === row.password_hash;
      needsMigration = isValid; // If legacy hash matches, we need to migrate to PBKDF2
    }
    
    if (!isValid) {
      return new Response(JSON.stringify({ ok: false, error: 'bad_credentials' }), { status: 401, headers: corsHeaders });
    }
    
    // Auto-migrate legacy users to PBKDF2
    if (needsMigration) {
      await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(pbkdf2Hash, row.id).run();
    }

    const headers = new Headers(corsHeaders);
    headers.append('Set-Cookie', setCookieHeader(username));

    // return user stats via /api/me style
    const me = await env.DB.prepare(`
      SELECT u.username,
             s.wins,
             s.games_played,
             s.streak_days,
             s.max_streak,
             CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
             CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
             s.last_daily_play
      FROM users u JOIN stats s ON s.user_id = u.id
      WHERE u.id = ?
    `).bind(row.id).first();

    return new Response(JSON.stringify({ ok: true, me }), { headers });
  }

  if (action === 'change_password') {
    // require username, currentPassword, newPassword
    const current = String(body.currentPassword || '');
    const next = String(body.newPassword || '');
    if (!current || !next) return new Response(JSON.stringify({ ok: false, error: 'bad_password' }), { status: 400, headers: corsHeaders });
    if (next.length < 8) return new Response(JSON.stringify({ ok: false, error: 'password_too_short' }), { status: 400, headers: corsHeaders });

    const row = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE username = ?`).bind(username).first();
    if (!row?.id) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: corsHeaders });
    
    // Try PBKDF2 first, fall back to legacy SHA-256 for verification
    const curPbkdf2Hash = await hashPassword(current);
    let isValid = curPbkdf2Hash === row.password_hash;
    
    if (!isValid) {
      const curLegacyHash = await sha256Hex(current);
      isValid = curLegacyHash === row.password_hash;
    }
    
    if (!isValid) {
      return new Response(JSON.stringify({ ok: false, error: 'bad_credentials' }), { status: 401, headers: corsHeaders });
    }

    // Always save new password with PBKDF2
    const newHash = await hashPassword(next);
    await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(newHash, row.id).run();

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: false, error: 'unknown_action' }), { status: 400, headers: corsHeaders });
}
