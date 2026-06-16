import { getStore } from "@netlify/blobs";

const STORE_NAME = "balotech-catalog";
const BLOB_KEY = "products";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-pin",
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const data = await store.get(BLOB_KEY, { type: "json" });
    return Response.json(data || { products: [], version: 1 }, { headers: corsHeaders() });
  }

  if (req.method === "POST") {
    const pin = req.headers.get("x-admin-pin");
    const expectedPin = process.env.ADMIN_PIN || "7742329";
    if (pin !== expectedPin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    await store.setJSON(BLOB_KEY, body);
    return Response.json({ ok: true }, { headers: corsHeaders() });
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
};
