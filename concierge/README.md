# Korea Rescue — AI Concierge (optional)

The app ships with a **free, static 4-language "Ask" matcher** that needs no server. This folder is the **optional upgrade** to a real Claude-powered concierge for free-form questions.

Why a server? Calling an LLM directly from the browser would expose your API key. This tiny **Cloudflare Worker** holds the key server-side and answers `{question, lang}` → `{answer}`. The site falls back to the static matcher automatically if the Worker is unreachable.

## Deploy (≈5 min, free tier)

1. Install Wrangler and log in:
   ```sh
   npm i -g wrangler
   wrangler login
   ```
2. From this `concierge/` folder, create `wrangler.toml`:
   ```toml
   name = "korea-rescue-concierge"
   main = "worker.js"
   compatibility_date = "2024-11-01"
   ```
3. Set your Anthropic API key as a **secret** (never commit it):
   ```sh
   wrangler secret put ANTHROPIC_API_KEY
   ```
   Get a key at https://console.anthropic.com → API Keys.
4. Deploy:
   ```sh
   wrangler deploy
   ```
   Wrangler prints a URL like `https://korea-rescue-concierge.<you>.workers.dev`.
5. In `../index.html`, set that URL:
   ```js
   const CFG = { conciergeApi: "https://korea-rescue-concierge.<you>.workers.dev" };
   ```
   Commit & push. The "Ask" box now uses Claude, with the static matcher as fallback.

## Cost & tuning
- Model is `claude-opus-4-8` at `effort: "low"` (concise answers). To cut cost, switch `MODEL` in `worker.js` to `claude-haiku-4-5`.
- Answers are capped at `max_tokens: 1024`.
- Lock it down for production: change `Access-Control-Allow-Origin` from `*` to your Pages origin (`https://clayborneyeounjunlee.github.io`), and consider a rate limit (Cloudflare WAF / a KV counter) so the key can't be abused.

## Notes
- No secrets live in this repo — the key is a Worker secret.
- Keep the static matcher: it's instant, free, and works offline-first even when the Worker is down.
