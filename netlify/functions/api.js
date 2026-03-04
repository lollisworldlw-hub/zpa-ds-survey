// netlify/functions/api.js

export default async (request, context) => {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyA2SdqQu8g6OUFz_S-eybmlzxjIcCVgrSCsodA4SetFeloQ1cWvWCv_VoeVBogfYOF8g/exec";

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  // Pull test params from the WEBSITE URL (Netlify)
  // Example: https://yoursite.netlify.app/?test=1&key=ZPA_TEST_123
  const url = new URL(request.url);
  const test = url.searchParams.get("test"); // "1"
  const key = url.searchParams.get("key") || "";

  // Read JSON body coming from your frontend
  let raw = await request.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (e) {
    data = {};
  }

  // Ensure payload exists
  if (!data.payload || typeof data.payload !== "object") data.payload = {};

  // If ?test=1&key=... then inject testMode + adminKey into payload
  if (test === "1" && key) {
    data.payload.testMode = true;
    data.payload.adminKey = key;
  }

  // Forward to Apps Script
  const upstream = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
