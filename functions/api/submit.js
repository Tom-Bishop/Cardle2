function isoNow() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Bad JSON", { status: 400 });

  const username = String(body.username || "").trim();
  const won = !!body.won;
  const guesses = Number(body.guesses || 0);
  const timeSeconds = Number(body.timeSeconds || 0);

  if (!username || username.length > 24) return new Response("Bad username", { status: 400 });
  if (!Number.isFinite(guesses) || guesses < 0 || guesses > 100) return new Response("Bad guesses", { status: 400 });
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds > 86400) return new Response("Bad timeSeconds", { status: 400 });

  const now = isoNow();

  // find or create user
  let user = await env.DB.prepare(`SELECT id FROM users WHERE username = ?`).bind(username).first();
  let userId = user?.id;

  if (!userId) {
    userId = uuid();
    await env.DB.prepare(`INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)`)
      .bind(userId, username, now)
      .run();

    await env.DB.prepare(`INSERT INTO stats (user_id, xp, level, streak_days, wins, games_played, total_guesses, total_time_seconds, updated_at)
                          VALUES (?, 0, 1, 0, 0, 0, 0, 0, ?)`)
      .bind(userId, now)
      .run();
  }

  // update stats: increment games_played, optionally wins, add guesses/time
  await env.DB.prepare(`
    UPDATE stats
    SET games_played = games_played + 1,
        wins = wins + ?,
        total_guesses = total_guesses + ?,
        total_time_seconds = total_time_seconds + ?,
        updated_at = ?
    WHERE user_id = ?
  `).bind(won ? 1 : 0, guesses, timeSeconds, now, userId).run();

  const me = await env.DB.prepare(`
    SELECT u.username,
           s.wins,
           s.games_played,
           s.total_guesses,
           s.total_time_seconds,
           CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
           CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
           s.updated_at
    FROM users u JOIN stats s ON s.user_id = u.id
    WHERE u.id = ?
  `).bind(userId).first();

  return Response.json({ ok: true, me });
}
