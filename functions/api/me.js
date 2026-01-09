export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = String(url.searchParams.get('username') || '').trim();
  if (!username) return new Response(JSON.stringify({ ok: false, error: 'missing_username' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const row = await env.DB.prepare(`
        SELECT u.username,
          s.wins,
          s.games_played,
          s.streak_days,
          s.max_streak,
          s.daily_played,
          s.daily_won,
          s.daily_streak,
          s.daily_max_streak,
          s.random_played,
          s.random_won,
          s.random_streak,
          s.random_max_streak,
          CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
          CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
          s.last_daily_play
    FROM users u JOIN stats s ON s.user_id = u.id
    WHERE u.username = ?
  `).bind(username).first();

  if (!row) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  return new Response(JSON.stringify({ ok: true, me: row }), { headers: { 'Content-Type': 'application/json' } });
}
