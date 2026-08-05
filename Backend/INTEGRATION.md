# AI Service — Integration Guide for Backend (NestJS)

This is a standalone Python/FastAPI service. It owns voice transcription, transaction extraction, and
market price prediction/recommendation. It does **not** touch your database or auth — it's stateless.
Your NestJS backend calls it over HTTP, gets JSON back, and decides what to persist.

## 1. Startup instructions

Requires Python 3.11+ (built on Python 3.14).

```bash
git clone <this repo>
cd "SABI MARKET"
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # defaults work out of the box, see section 2
uvicorn main:app --host 0.0.0.0 --port 8123
```

Verify it's up:

```bash
curl http://localhost:8123/health
# {"status":"ok"}
```

Interactive docs (Swagger UI — try every endpoint from the browser): **http://localhost:8123/docs**

## 2. Environment variables (`.env.example`)

```bash
WHISPER_MODEL_SIZE=small   # tiny | base | small | medium | large-v3
WHISPER_DEVICE=cpu         # cpu | cuda
WHISPER_COMPUTE_TYPE=int8

LLM_PROVIDER=mock          # mock | anthropic | openai | grok
LLM_API_KEY=               # required if LLM_PROVIDER isn't "mock"
LLM_MODEL=                 # optional, defaults to a sensible model per provider
```

- **`LLM_PROVIDER=mock`** (the default) needs **no API key at all** — it runs a rule-based extractor
  instead of a real LLM. Everything below works with zero setup on this default.
- No database credentials, no auth secrets — this service doesn't need any.

## 3. Dependencies

Full list in `requirements.txt` (installed via `pip install -r requirements.txt` above). Notable ones:
`fastapi` + `uvicorn` (the web server), `faster-whisper` (local speech-to-text, runs on CPU, no external
API), `anthropic`/`openai` (only used if `LLM_PROVIDER` is set to one of them), `httpx` (calls the
weather API for market recommendations).

## 4. API docs — three ways to get them

1. **Swagger UI** (interactive, try requests in-browser): `http://localhost:8123/docs`
2. **OpenAPI/Postman**: `openapi.json` is committed at the repo root. In Postman: **Import → File → select `openapi.json`** — this generates a full collection with every endpoint and schema automatically. It's always in sync with the actual code (re-export any time via `curl http://localhost:8123/openapi.json -o openapi.json`).
3. **This document** — full endpoint list + real examples below.

## 5. Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/api/v1/voice/voice-transaction` | Audio file → transcript → structured transactions |
| POST | `/api/v1/voice/extract-text` | Transcript text → structured transactions (skip Whisper) |
| GET | `/api/v1/market/predict` | Price trend prediction for one item at one market |
| GET | `/api/v1/market/recommend` | Best market to buy/sell an item, across all 3 markets |

---

### `GET /health`

**Response `200`:**
```json
{"status": "ok"}
```

---

### `POST /api/v1/voice/voice-transaction`

Multipart form upload, field name `audio`. Use this when you have a raw audio file (e.g. mobile app
recorded a `.wav`/`.m4a`) and need transcription done server-side.

```bash
curl -X POST http://localhost:8123/api/v1/voice/voice-transaction \
  -F "audio=@recording.wav;type=audio/wav"
```

**Response `200`:**
```json
{
  "transcript": "I buy 50 oranges for 5000 Naira, sell 2 for 200 Naira today.",
  "date": "2026-08-04",
  "transactions": [
    { "action": "buy", "item": "oranges", "quantity": 50.0, "unit": null, "amount": 5000.0, "currency": "NGN" },
    { "action": "sell", "item": "oranges", "quantity": 2.0, "unit": null, "amount": 200.0, "currency": "NGN" }
  ]
}
```

`action` is one of: `"buy"`, `"sell"`, `"debt_owed"`, `"debt_paid"`, `"expense"`, `"waste"`.

---

### `POST /api/v1/voice/extract-text`

Same output as above, but skips Whisper — use this when the client already has a transcript (e.g. the
browser's own `SpeechRecognition` API on the frontend).

**Request:**
```json
{ "transcript": "I buy 50 oranges for 5k, sell 2 for 200 naira today" }
```

**Response `200`:** identical shape to `voice-transaction` above.

```bash
curl -X POST http://localhost:8123/api/v1/voice/extract-text \
  -H "Content-Type: application/json" \
  -d '{"transcript": "I buy 50 oranges for 5k, sell 2 for 200 naira today"}'
```

---

### `GET /api/v1/market/predict`

**Query params:** `item` (required), `market` (optional, defaults to `"Mile 12"`; also accepts
`"Balogun"`, `"Agege"`)

```bash
curl -G http://localhost:8123/api/v1/market/predict \
  --data-urlencode "item=tomato" --data-urlencode "market=Mile 12"
```

**Response `200`:**
```json
{
  "item": "tomato",
  "market": "Mile 12",
  "unit": "basket",
  "current_avg_price": 19280.0,
  "trend": "up",
  "percent_change": 17.6,
  "confidence": "medium",
  "advice": "Tomato price dey rise for Mile 12 — sell now if you get stock. Rain dey come for Mile 12 — perishables fit cost more soon, no delay.",
  "data_source": "sample",
  "weather": {
    "market": "Mile 12",
    "temperature_c": 25.2,
    "condition": "rain likely",
    "rain_expected": true,
    "rain_probability_percent": 100.0
  }
}
```

`weather` is `null` for non-perishable items (currently only `beans`) — no weather call is made for
those. `data_source` is `"sample"` — prices are currently placeholder data (`data/sample_prices.json`),
not live/real prices yet; see that file's header for why.

**Response `404`** (unknown item/market):
```json
{ "detail": "No price history for 'avocado' at 'Mile 12'" }
```

---

### `GET /api/v1/market/recommend`

**Query params:** `item` (required), `action` (required, `"buy"` or `"sell"`)

```bash
curl -G http://localhost:8123/api/v1/market/recommend \
  --data-urlencode "item=tomato" --data-urlencode "action=buy"
```

**Response `200`:**
```json
{
  "item": "tomato",
  "action": "buy",
  "recommended_market": "Agege",
  "reason": "Agege has the best price for tomato right now (₦13,460), trending down. Rain is likely there soon (100% chance) — buy soon rather than wait.",
  "options": [
    { "market": "Agege", "current_avg_price": 13460.0, "trend": "down", "percent_change": -3.7, "weather": { "market": "Agege", "temperature_c": 24.7, "condition": "rain likely", "rain_expected": true, "rain_probability_percent": 100.0 } },
    { "market": "Balogun", "current_avg_price": 17260.0, "trend": "stable", "percent_change": 0.7, "weather": { "market": "Balogun", "temperature_c": 25.3, "condition": "rain likely", "rain_expected": true, "rain_probability_percent": 100.0 } },
    { "market": "Mile 12", "current_avg_price": 19280.0, "trend": "up", "percent_change": 17.6, "weather": { "market": "Mile 12", "temperature_c": 25.2, "condition": "rain likely", "rain_expected": true, "rain_probability_percent": 100.0 } }
  ]
}
```

`options` lists every market considered, in ranked order — useful if you want to show the full
comparison in the UI rather than just the top pick.

**Response `404`** (item has no data at all): `{ "detail": "No price history for 'avocado' in any market" }`

## 6. Error shape (all endpoints)

Standard FastAPI/HTTPException shape:

```json
{ "detail": "human-readable message" }
```

- `404` — item/market not found
- `422` — request validation failed (e.g. missing required field, wrong type) — FastAPI generates this
  automatically from the schemas; body will list which field(s) failed
- `500` — unexpected server error (check the service logs)

## 7. Notes for integration

- **This service has no auth of its own.** If you need to restrict who can call it, put that check in
  your NestJS layer before proxying the request — the AI service assumes it's only reachable from your
  trusted backend, not directly from end users.
- **Stateless.** Nothing here persists across requests. Every response is computed fresh; save whatever
  you need into your own database.
- CORS is wide open (`allow_origins=["*"]`) since this is meant to be called server-to-server or from a
  trusted frontend during development — tighten this before any public deployment.
