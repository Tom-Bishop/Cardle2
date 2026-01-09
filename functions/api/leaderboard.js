export async function onRequestGet({ env }) {
  // Return leaderboard entries with wins, avg guesses and avg time
  const { results } = await env.DB.prepare(`
    SELECT u.username,
           s.wins,
           s.games_played,
           CASE WHEN s.games_played > 0 THEN (CAST(s.total_guesses AS FLOAT)/s.games_played) ELSE NULL END AS avg_guesses,
           CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE NULL END AS avg_time_seconds
    FROM stats s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.wins DESC, (CASE WHEN s.games_played > 0 THEN (CAST(s.total_time_seconds AS FLOAT)/s.games_played) ELSE 999999 END) ASC
    LIMIT 50
  `).all();

  return Response.json({ ok: true, results });
}
