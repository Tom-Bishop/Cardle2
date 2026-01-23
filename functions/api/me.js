const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = String(url.searchParams.get('username') || '').trim();
  if (!username) return new Response(JSON.stringify({ ok: false, error: 'missing_username' }), { status: 400, headers: corsHeaders });
  try {
    // Try the new schema (with separate daily/random columns)
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

    if (!row) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: corsHeaders });

    return new Response(JSON.stringify({ ok: true, me: row }), { headers: corsHeaders });
  } catch (err) {
    // Fallback to older schema where daily/random columns may not exist
    try {
      const row = await env.DB.prepare(`
        SELECT u.username,
               s.wins,
               s.games_played,
               s.total_guesses,
               s.total_time_seconds,
               s.streak_days,
               s.max_streak,
               CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
               CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
               s.last_daily_play
        FROM users u JOIN stats s ON s.user_id = u.id
        WHERE u.username = ?
      `).bind(username).first();

      if (!row) return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404, headers: corsHeaders });

      // Map older schema to the newer expected shape with sensible defaults
      const mapped = Object.assign({}, row, {
        daily_played: row.games_played || 0,
        daily_won: row.wins || 0,
        daily_streak: row.streak_days || 0,
        daily_max_streak: row.max_streak || 0,
        random_played: 0,
        random_won: 0,
        random_streak: 0,
        random_max_streak: 0
      });

      return new Response(JSON.stringify({ ok: true, me: mapped }), { headers: corsHeaders });
    } catch (err2) {
      return new Response(JSON.stringify({ ok: false, error: 'db_error', details: String(err2) }), { status: 500, headers: corsHeaders });
    }
  }
}
