export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT 1 AS ok;").first();
  return Response.json(row);
}
