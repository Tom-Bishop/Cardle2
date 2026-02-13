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
    // Query stats with deduplicated columns (using daily_plays, daily_wins, etc)
    const row = await env.DB.prepare(`
        SELECT u.username,
          s.wins,
          s.games_played,
          s.streak_days,
          s.max_streak,
          s.daily_plays,
          s.daily_wins,
          s.daily_streak,
          s.daily_max_streak,
          s.random_plays,
          s.random_wins,
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
    console.error('Error fetching user stats:', err);
    return new Response(JSON.stringify({ ok: false, error: 'db_error', details: String(err) }), { status: 500, headers: corsHeaders });
  }
}
