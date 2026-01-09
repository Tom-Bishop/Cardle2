function isoNow() { return new Date().toISOString(); }

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return new Response("Bad JSON", { status: 400 });

    const username = String(body.username || "").trim();
    const mode = String(body.mode || "daily").trim(); // 'daily' or 'random'
    const won = !!body.won;
    const guesses = Number(body.guesses || 0);
    const timeSeconds = Number(body.timeSeconds || 0);

    if (!username || username.length > 24) return new Response("Bad username", { status: 400 });
    if (!Number.isFinite(guesses) || guesses < 0 || guesses > 100) return new Response("Bad guesses", { status: 400 });
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds > 86400) return new Response("Bad timeSeconds", { status: 400 });
    if (mode !== 'daily' && mode !== 'random') return new Response("Bad mode", { status: 400 });

    const now = isoNow();

    // Find user
    let user = await env.DB.prepare(`SELECT id FROM users WHERE username = ?`).bind(username).first();
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: 'user_not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const userId = user.id;
    const today = new Date().toISOString().split('T')[0];

    if (mode === 'daily') {
      // Check if already played today
      const existing = await env.DB.prepare(`SELECT last_daily_play, daily_streak, daily_max_streak FROM stats WHERE user_id = ?`).bind(userId).first();
      if (existing?.last_daily_play === today) {
        return new Response(JSON.stringify({ ok: false, error: 'daily_played_today' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      // Compute new streak
      let newStreak = 0;
      let newMaxStreak = existing?.daily_max_streak || 0;
      
      if (won) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (existing?.last_daily_play === yesterday) {
          newStreak = (existing?.daily_streak || 0) + 1;
        } else {
          newStreak = 1;
        }
        newMaxStreak = Math.max(newMaxStreak, newStreak);
      } else {
        newStreak = 0;
      }

      await env.DB.prepare(`
        UPDATE stats
        SET daily_played = daily_played + 1,
            daily_won = daily_won + ?,
            daily_streak = ?,
            daily_max_streak = ?,
            last_daily_play = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(won ? 1 : 0, newStreak, newMaxStreak, today, now, userId).run();
    } else {
      // Random mode - no streak tracking, just update win/loss
      const existingStreak = await env.DB.prepare(`SELECT random_streak, random_max_streak FROM stats WHERE user_id = ?`).bind(userId).first();
      let newStreak = 0;
      let newMaxStreak = existingStreak?.random_max_streak || 0;

      if (won) {
        newStreak = (existingStreak?.random_streak || 0) + 1;
        newMaxStreak = Math.max(newMaxStreak, newStreak);
      } else {
        newStreak = 0;
      }

      await env.DB.prepare(`
        UPDATE stats
        SET random_played = random_played + 1,
            random_won = random_won + ?,
            random_streak = ?,
            random_max_streak = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(won ? 1 : 0, newStreak, newMaxStreak, now, userId).run();
    }

    // Return updated stats
    const updatedStats = await env.DB.prepare(`
      SELECT daily_played, daily_won, daily_streak, daily_max_streak,
             random_played, random_won, random_streak, random_max_streak
      FROM stats
      WHERE user_id = ?
    `).bind(userId).first();

    return Response.json({ ok: true, stats: updatedStats });
  } catch (err) {
    console.error('Stats error:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
