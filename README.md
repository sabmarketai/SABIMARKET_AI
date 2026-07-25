# SabiMarket AI

Voice-first market assistant for Nigerian informal traders. A trader speaks a transaction out loud;
the app turns it into structured, saved data. This repo contains both the backend AI service and the
frontend Next.js PWA.

## Backend — AI Voice Transaction Service

FastAPI backend that turns a trader's spoken voice note into structured transaction data:
**audio in → Whisper transcription → JSON out.**

### API contract (for frontend integration)

**Base URL (local dev, same WiFi network):** `http://192.168.100.13:8123`

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

**Frontend integration point:** `lib/parseTransaction.ts` currently fakes this step with a local regex
parser. Replace it with a call to the endpoint above, keeping the same `ParsedClause[]` return shape
so no UI code needs to change. Show a "did I get this right?" confirmation screen with the parsed
fields editable before saving — don't auto-save silently.

### Database (Firebase/Supabase)

This service is **stateless** — it does not store anything. Each `transactions[]` entry returned above
is what you write into your own transactions table/collection, tagged with the logged-in user's ID and
(if you want) the raw `transcript` for an audit trail. This service has no auth and no user concept;
that lives in the database layer.

### Running the backend locally

```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8123
```

`--host 0.0.0.0` is what makes it reachable from other devices on the same WiFi (not just `localhost`).
Devices must be on the **same WiFi network** as this machine, and this machine's IP may change if it
reconnects to WiFi — re-check with `ipconfig getifaddr en0` if the URL stops working.

### AI provider setup (when ready to move off the mock extractor)

Copy `.env.example` to `.env` and fill in:

```
LLM_PROVIDER=anthropic   # or openai / grok
LLM_API_KEY=sk-...
```

No code changes needed — `src/services/extraction_service.py` picks the right path automatically.

## Frontend — Next.js PWA

Frontend-complete scaffold: real UI, real routing, real voice capture, real offline shell, with mock
data standing in for the backend above.

### Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom token system, see `tailwind.config.ts`
- **Zustand** (`lib/store.ts`) — local state + `localStorage` persistence, so
  transactions survive a refresh and work fully offline
- **Framer Motion** — mic button micro-interactions
- **next-pwa** — service worker, offline fallback, installable manifest
- **lucide-react** — icons

### Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The service worker only registers in
production builds (`npm run build && npm run start`), so to test the actual
PWA install prompt / offline behavior, run a production build.

To test on a real Android phone on your network (recommended — this is
where voice input and "add to home screen" actually matter):

```bash
npm run build && npm run start -- -H 0.0.0.0
```

then visit `http://<your-machine-ip>:3000` from the phone, on the same
Wi-Fi. Voice recognition (`SpeechRecognition`) requires either `localhost`
or `https://`, so for real device testing over LAN you'll eventually want a
tunnel (ngrok / Cloudflare Tunnel) or to deploy to Vercel.

### Routes

| Route            | Purpose                                                   |
|-------------------|------------------------------------------------------------|
| `/`               | Dashboard — today's profit, pending sync, recent activity |
| `/record`         | Voice-first transaction recorder (the core feature)        |
| `/market`         | Smart Market Intelligence — crowdsourced prices            |
| `/community`      | Group alerts, supplier/buyer matching feed                 |
| `/transactions`   | Full ledger with buy/sell filter                            |
| `/settings`       | Language, sync status, demo data reset                     |
| `/offline`        | Shown by the service worker when a page fails offline       |

Navigation is a bottom tab bar (`components/BottomNav.tsx`) with the mic
button raised as the signature element — this mirrors how the pitch
describes the product: voice is not a feature bolted onto a form-based app,
it's the primary way traders interact with it.

### How voice recording works right now

`components/VoiceRecorder.tsx`:

1. Uses the browser's `SpeechRecognition` API (Chrome/Android — the
   realistic install base for this audience) for live transcription.
2. If unsupported (Safari, some WebViews, or genuinely offline), it falls
   back to a sample transcript so you can still demo the full flow end to
   end without a working mic.
3. Passes the transcript to `lib/parseTransaction.ts`, a small regex-based
   parser that pulls out "buy/sell `<qty>` `<item>` for `<amount>`" clauses —
   this stands in for the real AI parsing step, see the backend section above.
4. Shows each parsed line as an editable card so the trader can correct a
   misheard number before saving — important given noisy market
   environments and imperfect transcription.
5. Saves confirmed transactions into the Zustand store, marked `synced:
   false` until a real backend exists to sync them.

### Where the backend plugs in

Everything backend-shaped is isolated so you can swap it without touching
UI code:

- **`lib/mockData.ts`** — seed transactions, market prices, community
  posts. Replace the imports of these constants with real fetches (e.g.
  from Firestore, per your usual stack) in `app/market/page.tsx`,
  `app/community/page.tsx`, and `lib/store.ts`'s initial state.
- **`lib/parseTransaction.ts`** — replace the regex parser with a call to
  the AI service documented above. Keep the same `ParsedClause[]` return
  shape and the UI needs no changes.
- **`lib/store.ts`** — `addTransactions` / `markSynced` are where you'd
  hook in an actual sync call (e.g. a Firestore write, retried via a
  background sync queue) once `navigator.onLine` flips back to `true`.
- **Auth** — there's none yet. `app/settings/page.tsx` is the natural home
  for a sign-in / market-association picker once you add it.

### Design notes

The palette and type system are deliberately drawn from the market itself
rather than a generic fintech look: adire-dye indigo, palm-oil gold,
scotch-bonnet pepper red, cassava-leaf green, terracotta clay — see the
comment block at the top of `tailwind.config.ts`. Transaction cards use a
perforated "receipt edge" (`.receipt-edge` in `globals.css`) since that's
the physical object this feature replaces. Numbers (prices, amounts) are
set in monospace throughout so figures always align and read as data, not
prose.

### Known gaps / next steps

- No auth, no real backend wiring yet — see the integration points above.
- `SpeechRecognition` is not a web standard and support varies; the backend's
  Whisper endpoint is the fix for consistent transcription across devices,
  especially for Pidgin accuracy.
- Icons in `public/icons/` are placeholders generated for this scaffold —
  swap in real branded icons before shipping.
- No automated tests yet.
