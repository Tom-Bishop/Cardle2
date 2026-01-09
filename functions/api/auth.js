async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ ok: false, error: 'bad_json' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const action = String(body.action || '').trim(); // 'register' or 'login'
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!username || username.length > 24) return new Response(JSON.stringify({ ok: false, error: 'bad_username' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  if (!password) return new Response(JSON.stringify({ ok: false, error: 'bad_password' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const now = new Date().toISOString();

  if (action === 'register') {
    // check existing
    const exists = await env.DB.prepare(`SELECT id FROM users WHERE username = ?`).bind(username).first();
    if (exists?.id) return new Response(JSON.stringify({ ok: false, error: 'username_taken' }), { status: 409, headers: { 'Content-Type': 'application/json' } });

    const id = crypto.randomUUID();
    const hash = await sha256Hex(password);
    await env.DB.prepare(`INSERT INTO users (id, username, created_at, password_hash) VALUES (?, ?, ?, ?)`)
      .bind(id, username, now, hash).run();

    await env.DB.prepare(`INSERT INTO stats (user_id, xp, level, streak_days, wins, games_played, total_guesses, total_time_seconds, updated_at) VALUES (?, 0, 1, 0, 0, 0, 0, 0, ?)`)
      .bind(id, now).run();

    // set cookie
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `cardleUsername=${encodeURIComponent(username)}; Path=/; SameSite=Lax`);
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  if (action === 'login') {
    const row = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE username = ?`).bind(username).first();
    if (!row?.id) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const hash = await sha256Hex(password);
    if (hash !== row.password_hash) return new Response(JSON.stringify({ ok: false, error: 'bad_credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `cardleUsername=${encodeURIComponent(username)}; Path=/; SameSite=Lax`);

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

  return new Response(JSON.stringify({ ok: false, error: 'unknown_action' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}
