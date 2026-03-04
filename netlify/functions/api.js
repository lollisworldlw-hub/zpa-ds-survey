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

  // 1) Try to read test/key from the function URL (rare, since your fetch doesn't include it)
  const fnUrl = new URL(request.url);
  let test = fnUrl.searchParams.get("test");
  let key = fnUrl.searchParams.get("key") || "";

  // 2) If not present, read from the page URL via Referer header (this is the real fix)
  if (test !== "1" || !key) {
    const referer = request.headers.get("referer") || request.headers.get("referrer") || "";
    if (referer) {
      try {
        const refUrl = new URL(referer);
        test = refUrl.searchParams.get("test") || test;
        key = refUrl.searchParams.get("key") || key;
      } catch (e) {
        // ignore
      }
    }
  }

  // Read JSON body from frontend
  let data = {};
  try {
    data = await request.json();
  } catch (e) {
    data = {};
  }

  // Ensure payload exists
  if (!data.payload || typeof data.payload !== "object") data.payload = {};

  // Inject testMode/adminKey if present
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
