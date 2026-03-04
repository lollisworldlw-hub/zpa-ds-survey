export default async (request, context) => {

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyA2SdqQu8g6OUFz_S-eybmlzxjIcCVgrSCsodA4SetFeloQ1cWvWCv_VoeVBogfYOF8g/exec";

  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  const body = await request.text();

  const upstream = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
