const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT 1 AS ok;").first();
  return Response.json(row, { headers: corsHeaders });
}
