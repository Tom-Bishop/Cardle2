const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestGet({ env }) {
  // Return leaderboard entries with mode-specific stats
  const { results } = await env.DB.prepare(`
        SELECT u.username,
          s.wins,
          s.games_played,
          s.streak_days,
          s.max_streak,
          CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
          CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds,
          s.daily_plays,
          s.daily_wins,
          s.daily_guesses,
          s.daily_time,
          s.random_plays,
          s.random_wins,
          s.random_guesses,
          s.random_time
    FROM stats s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.wins DESC, (CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE 999999 END) ASC
    LIMIT 50
  `).all();

  return Response.json({ ok: true, results }, { headers: corsHeaders });
}
