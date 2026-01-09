function isoNow() { return new Date().toISOString(); }
function uuid() { return crypto.randomUUID(); }

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Bad JSON", { status: 400 });

  const username = String(body.username || "").trim();
  const xpDelta = Number(body.xpDelta || 0);

  if (!username || username.length > 24) return new Response("Bad username", { status: 400 });
  if (!Number.isFinite(xpDelta) || Math.abs(xpDelta) > 5000) return new Response("Bad xpDelta", { status: 400 });

  const now = isoNow();

  let user = await env.DB.prepare(`SELECT id FROM users WHERE username = ?`)
    .bind(username)
    .first();

  let userId = user?.id;

  if (!userId) {
    userId = uuid();
    await env.DB.prepare(`INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)`)
      .bind(userId, username, now)
      .run();

    await env.DB.prepare(`INSERT INTO stats (user_id, xp, level, streak_days, updated_at)
                          VALUES (?, 0, 1, 0, ?)`)
      .bind(userId, now)
      .run();
  }

  await env.DB.prepare(`UPDATE stats SET xp = xp + ?, updated_at = ? WHERE user_id = ?`)
    .bind(xpDelta, now, userId)
    .run();

  const me = await env.DB.prepare(`
    SELECT u.username, s.xp, s.level, s.streak_days, s.updated_at
    FROM users u JOIN stats s ON s.user_id = u.id
    WHERE u.id = ?
  `).bind(userId).first();

  return Response.json({ ok: true, me });
}
