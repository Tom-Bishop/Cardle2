export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT u.username, s.xp, s.level, s.streak_days, s.updated_at
    FROM stats s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.xp DESC
    LIMIT 50
  `).all();

  return Response.json({ ok: true, results });
}
