# SabiMarket AI — Voice Transaction Service

FastAPI backend that turns a trader's spoken voice note into structured transaction data:
**audio in → Whisper transcription → JSON out.**

## For FS1 (frontend / Flutter / Next.js)

**Base URL (during local dev, same WiFi network):** `http://192.168.100.13:8123`

**Endpoint:** `POST /api/v1/voice/voice-transaction`

Send the recorded audio as a multipart form upload, field name `audio`:

```bash
curl -X POST http://192.168.100.13:8123/api/v1/voice/voice-transaction \
  -F "audio=@recording.wav;type=audio/wav"
```

```js
// fetch example
const form = new FormData();
form.append("audio", audioBlob, "recording.wav");
const res = await fetch("http://192.168.100.13:8123/api/v1/voice/voice-transaction", {
  method: "POST",
  body: form,
});
const data = await res.json();
```

**Response shape** (see `src/schemas/transaction.py` for the source of truth):

```json
{
  "transcript": "I buy 50 oranges for 5000 Naira, sell 2 for 200 Naira today.",
  "date": "2026-07-24",
  "transactions": [
    { "action": "buy", "item": "oranges", "quantity": 50.0, "unit": null, "amount": 5000.0, "currency": "NGN" },
    { "action": "sell", "item": "oranges", "quantity": 2.0, "unit": null, "amount": 200.0, "currency": "NGN" }
  ]
}
```

Full interactive docs (try it from the browser): `http://192.168.100.13:8123/docs`

Show the user a "did I get this right?" confirmation screen with these fields editable before saving — per the sprint plan, don't auto-save silently.

## For FS2 (database / Firebase / Supabase)

This service is **stateless** — it does not store anything. Each `transactions[]` entry returned above is what you write into your own transactions table/collection, tagged with the logged-in user's ID and (if you want) the raw `transcript` for an audit trail. This service has no auth and no user concept; that all lives in your database layer.

## Running it locally

```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8123
```

`--host 0.0.0.0` is what makes it reachable from other devices on the same WiFi (not just `localhost`). Your teammates' phones/laptops must be on the **same WiFi network** as this machine, and this machine's IP may change if you reconnect to WiFi — re-check with `ipconfig getifaddr en0` if the URL stops working.

## AI provider setup (when ready to move off the mock extractor)

Copy `.env.example` to `.env` and fill in:

```
LLM_PROVIDER=anthropic   # or openai / grok
LLM_API_KEY=sk-...
```

No code changes needed — `src/services/extraction_service.py` picks the right path automatically.
