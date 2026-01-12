function isoNow() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return new Response("Bad JSON", { status: 400 });

    const username = String(body.username || "").trim();
    const won = !!body.won;
    const guesses = Number(body.guesses || 0);
    const timeSeconds = Number(body.timeSeconds || 0);
    const mode = String(body.mode || '').trim(); // 'daily' or 'random'

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

    // If mode is daily, check last_daily_play to prevent multiple plays and update streaks
    const today = new Date().toISOString().split('T')[0];
    if (mode === 'daily') {
      const existing = await env.DB.prepare(`SELECT last_daily_play, streak_days, max_streak FROM stats WHERE user_id = ?`).bind(userId).first();
      if (existing?.last_daily_play === today) {
        return new Response(JSON.stringify({ ok: false, error: 'daily_played_today' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      // compute new streak
      let newStreak = 0;
      let newMax = existing?.max_streak || 0;
      if (won) {
        // compute previous business day (skip weekends)
        const d = new Date();
        d.setDate(d.getDate() - 1);
        while (d.getDay() === 0 || d.getDay() === 6) { d.setDate(d.getDate() - 1); }
        const prevBusiness = d.toISOString().split('T')[0];
        if (existing?.last_daily_play === prevBusiness) {
          newStreak = (existing?.streak_days || 0) + 1;
        } else {
          newStreak = 1;
        }
        if (newStreak > newMax) newMax = newStreak;
      } else {
        newStreak = 0;
      }

      await env.DB.prepare(`
        UPDATE stats
        SET games_played = games_played + 1,
            wins = wins + ?,
            total_guesses = total_guesses + ?,
            total_time_seconds = total_time_seconds + ?,
            last_daily_play = ?,
            streak_days = ?,
            max_streak = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(won ? 1 : 0, guesses, timeSeconds, today, newStreak, newMax, now, userId).run();
    } else {
      await env.DB.prepare(`
        UPDATE stats
        SET games_played = games_played + 1,
            wins = wins + ?,
            total_guesses = total_guesses + ?,
            total_time_seconds = total_time_seconds + ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(won ? 1 : 0, guesses, timeSeconds, now, userId).run();
    }

    const me = await env.DB.prepare(`
      SELECT u.username,
             s.wins,
             s.games_played,
             s.total_guesses,
             s.total_time_seconds,
             CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
                CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
                  s.updated_at,
                  s.last_daily_play
      FROM users u JOIN stats s ON s.user_id = u.id
      WHERE u.id = ?
    `).bind(userId).first();

    return Response.json({ ok: true, me });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
