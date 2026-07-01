/**
 * Korea Rescue — AI Concierge (Cloudflare Worker)
 * ------------------------------------------------------------------
 * A tiny serverless proxy so the static site can offer a real AI concierge
 * WITHOUT exposing an API key in the browser. The site POSTs {question, lang};
 * this Worker calls Claude server-side and returns {answer}.
 *
 * Deploy: see concierge/README.md. The key is a Worker SECRET, never in code.
 *   wrangler secret put ANTHROPIC_API_KEY
 * Then paste the Worker URL into CFG.conciergeApi in ../index.html.
 *
 * Model: claude-opus-4-8 (Anthropic's most capable). To cut cost for this
 * simple Q&A you may switch MODEL to "claude-haiku-4-5" — that is your call.
 */

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are the AI concierge for "Korea Rescue", a survival guide for foreign travelers and overseas Koreans (gyopo) in South Korea.

Answer the user's question directly and concisely (max 4 short sentences). No preamble, no "great question". Reply in the SAME language as the user's question (English, Korean, Japanese, or Chinese). Only give practical, accurate Korea-travel help; if asked something off-topic, say you only cover traveling in Korea. Never invent prices, app names, or rules — if unsure, say so and point to the official source.

Key facts to use:
- The root blocker behind most hard tasks is "본인인증" (Korean identity verification): it needs a Korean phone in your name + a Korean ID number, which tourists don't have. You cannot pass it — route around it (passport/guest checkout, international partners, station counters, WOWPASS/NAMANE for card payments, Samsung Pay on a Samsung phone).
- eSIM: buy before arrival; foreign card works; powers maps/taxi/translation. (Klook, Airalo)
- Transit + payment card: WOWPASS (prepaid debit + currency exchange + T-money, kiosk cash top-up), NAMANE (app top-up with a foreign card), Climate Card (Seoul unlimited pass; iPhone needs the physical card), T-money (simplest, nationwide, cash top-up). Mobile T-money usually needs a Korean card.
- KTX trains: book with passport on Trip.com / Klook / KKday (official Korail partners, foreign cards work). Korail's own site often fails foreign cards. Korail Pass for multi-city. Avoid Rail Ninja (huge markups).
- Taxi: k.ride (Kakao's foreigner app — foreign cards, shows destination to driver in 100+ languages) or Kakao T with "pay to the driver". Use Kakao Map / Naver Map, not Google Maps (weak in Korea).
- Food: reserve in English on CatchTable Global; judge by Naver visitor reviews (500+, 4.0+); HappyCow/Creatrip for vegan/halal.
- Tickets / K-pop: NOL World, Melon Global, Klook, Trazy. Korean ticket sites need a Korean ID/card.
- Translation: Papago or Google Lens camera.

End the answer by naming the single most useful service or the relevant Korea Rescue section.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",            // tighten to your Pages origin in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
    const question = (body && body.question ? String(body.question) : "").slice(0, 1000).trim();
    if (!question) return json({ error: "empty question" }, 400);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "server not configured" }, 500);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        output_config: { effort: "low" },   // simple Q&A — keep it fast & cheap
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: "upstream error", status: res.status, detail }, 502);
    }
    const data = await res.json();
    const answer = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return json({ answer });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
