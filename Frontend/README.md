# SabiMarket AI — Next.js PWA

Voice-first market assistant for Nigerian informal traders. This is a
frontend-complete scaffold: real UI, real routing, real voice capture, real
offline shell — with mock data standing in for the backend you'll add later.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom token system, see `tailwind.config.ts`
- **Zustand** (`lib/store.ts`) — local state + `localStorage` persistence, so
  transactions survive a refresh and work fully offline
- **Framer Motion** — mic button micro-interactions
- **next-pwa** — service worker, offline fallback, installable manifest
- **lucide-react** — icons

## Getting started

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

## Routes

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

## How voice recording works right now

`components/VoiceRecorder.tsx`:

1. Uses the browser's `SpeechRecognition` API (Chrome/Android — the
   realistic install base for this audience) for live transcription.
2. If unsupported (Safari, some WebViews, or genuinely offline), it falls
   back to a sample transcript so you can still demo the full flow end to
   end without a working mic.
3. Passes the transcript to `lib/parseTransaction.ts`, a small regex-based
   parser that pulls out "buy/sell `<qty>` `<item>` for `<amount>`" clauses —
   this stands in for the real AI parsing step ("AI transcribes, logs
   inventory, calculates profit automatically").
4. Shows each parsed line as an editable card so the trader can correct a
   misheard number before saving — important given noisy market
   environments and imperfect transcription.
5. Saves confirmed transactions into the Zustand store, marked `synced:
   false` until a real backend exists to sync them.

## Where the backend plugs in

Everything backend-shaped is isolated so you can swap it without touching
UI code:

- **`lib/mockData.ts`** — seed transactions, market prices, community
  posts. Replace the imports of these constants with real fetches (e.g.
  from Firestore, per your usual stack) in `app/market/page.tsx`,
  `app/community/page.tsx`, and `lib/store.ts`'s initial state.
- **`lib/parseTransaction.ts`** — replace the regex parser with a call to
  your AI service (the pitch names Grok / an open-source model). Keep the
  same `ParsedClause[]` return shape and the UI needs no changes.
- **`lib/store.ts`** — `addTransactions` / `markSynced` are where you'd
  hook in an actual sync call (e.g. a Firestore write, retried via a
  background sync queue) once `navigator.onLine` flips back to `true`.
- **Auth** — there's none yet. `app/settings/page.tsx` is the natural home
  for a sign-in / market-association picker once you add it.

## Design notes

The palette and type system are deliberately drawn from the market itself
rather than a generic fintech look: adire-dye indigo, palm-oil gold,
scotch-bonnet pepper red, cassava-leaf green, terracotta clay — see the
comment block at the top of `tailwind.config.ts`. Transaction cards use a
perforated "receipt edge" (`.receipt-edge` in `globals.css`) since that's
the physical object this feature replaces. Numbers (prices, amounts) are
set in monospace throughout so figures always align and read as data, not
prose.

## Backend API Integration Guide

This section documents every endpoint the backend must provide for the frontend to work fully. All timestamps are ISO 8601 strings. The frontend stores failed syncs locally and will retry when `navigator.onLine` becomes `true`.

### Core Data Types (Response Schemas)

```typescript
// Transaction (user's buy/sell records)
{
  id: string;
  kind: "buy" | "sell";
  item: string;              // e.g. "Oranges", "Tomatoes basket"
  quantity: number;
  unit: string;              // e.g. "pieces", "basket", "paint rubber", "bags"
  amount: number;            // in Naira
  market: string;            // e.g. "Mile 12 Market", "Ojota Market"
  createdAt: string;         // ISO 8601
  synced: boolean;           // local flag only; not sent to backend
  transcript?: string;       // raw voice transcription (optional)
}

// Market Price (crowdsourced/aggregated prices)
{
  id: string;
  item: string;
  market: string;
  pricePerUnit: number;      // in Naira
  unit: string;
  trend: "up" | "down" | "flat";
  changePercent: number;     // % change vs. previous period
  note?: string;             // e.g. "Tomatoes dey cheap for Mile 12 today — go now before rain."
  updatedAt: string;         // ISO 8601
}

// Community Post (alerts, supplier/buyer matching)
{
  id: string;
  authorName: string;
  associationName: string;   // e.g. "Mile 12 Traders Union"
  message: string;
  type: "alert" | "supplier" | "buyer" | "general";
  createdAt: string;         // ISO 8601
}

// User (for future auth)
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  market: string;            // primary market association
  language: "english" | "pidgin";
  createdAt: string;         // ISO 8601
}
```

### Authentication (Future Implementation)

The frontend has no auth UI yet, but these endpoints should be built to support signup/login later:

#### `POST /auth/register`
- **Body:** `{ name: string; phone?: string; email?: string; market: string; password: string; }`
- **Response:** `{ user: User; token: string; }`
- **Note:** The app will store the token in localStorage and include it as `Authorization: Bearer <token>` in all subsequent requests.

#### `POST /auth/login`
- **Body:** `{ phone?: string; email?: string; password: string; }`
- **Response:** `{ user: User; token: string; }`

#### `POST /auth/logout`
- **Body:** `{}`
- **Response:** `{ success: true; }`

---

### Transactions (Core Feature — Voice Recording & Ledger)

All transaction endpoints require the user to be authenticated.

#### `POST /transactions`
**Create (save) one or more transactions.**

- **Body:**
  ```json
  {
    transactions: [
      {
        kind: "buy" | "sell",
        item: string,
        quantity: number,
        unit: string,
        amount: number,
        market: string,
        createdAt: string,
        transcript?: string
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    saved: [
      { id: string; createdAt: string; ...rest of Transaction }
    ]
  }
  ```
- **Frontend flow:**
  1. User records voice via microphone.
  2. Transcript sent to `/ai/parse` (see below).
  3. User edits parsed clauses in the UI.
  4. On "Save", frontend calls this endpoint with the final transactions.
  5. On success, frontend marks all transactions `synced: true` in local store.
  6. On failure (network), frontend keeps `synced: false` and retries on next sync.

#### `GET /transactions`
**Fetch user's transaction history (paginated).**

- **Query Params:**
  - `limit?: number` (default: 50; max 500)
  - `offset?: number` (default: 0)
  - `kind?: "buy" | "sell"` (optional filter)
  - `market?: string` (optional; filter by market)
  - `startDate?: string` (optional; ISO 8601; fetch from this date onward)
  - `endDate?: string` (optional; ISO 8601; fetch up to this date)
- **Response:**
  ```json
  {
    transactions: [Transaction],
    total: number,
    limit: number,
    offset: number
  }
  ```
- **Frontend usage:**
  - Dashboard home page calls this to populate "Recent activity" (limit 4, offset 0).
  - Transactions ledger page calls this with optional `kind` filter.
  - Profit calculation is done client-side: sum all `sell` amounts, subtract all `buy` amounts for today's date.

#### `GET /transactions/:id`
**Fetch a single transaction by ID.**

- **Response:** `Transaction`
- **Frontend usage:** Not currently used; reserved for future detail view or edit.

#### `DELETE /transactions/:id`
**Delete a transaction (for correction).**

- **Response:** `{ success: true; }`
- **Frontend usage:** Not currently implemented; reserved for future corrections UI.

---

### Market Intelligence (Crowdsourced Prices)

These endpoints do **not** require authentication; they are read-only and shared across all users.

#### `GET /market/prices`
**Fetch all market prices, optionally filtered by item or market.**

- **Query Params:**
  - `item?: string` (optional; filter by item name, case-insensitive fuzzy match)
  - `market?: string` (optional; filter by market)
  - `limit?: number` (default: 100)
  - `offset?: number` (default: 0)
- **Response:**
  ```json
  {
    prices: [MarketPrice],
    total: number
  }
  ```
- **Frontend usage:** Market Intelligence page calls this without filters to show all prices.
- **Data source:** This should aggregate price reports from:
  - User transaction history (inferred prices: if a user sold 10 tomatoes for ₦150k, that's ₦15k per unit).
  - Crowdsourced price submissions (future form in Community or Market page).
  - External price APIs (if available for Nigerian commodities).
  - Manual inputs by admin/market associations.

#### `GET /market/prices/trending`
**Fetch top trending price movements (most volatile items).**

- **Query Params:**
  - `market?: string` (optional; if omitted, return trending across all markets)
  - `limit?: number` (default: 10)
- **Response:**
  ```json
  {
    trends: [MarketPrice]
  }
  ```
- **Frontend usage:** Could populate a "What's hot" section on dashboard in the future.

#### `POST /market/prices` (Future)
**Submit a price observation (crowdsourced contribution).**

- **Body:**
  ```json
  {
    item: string,
    market: string,
    pricePerUnit: number,
    unit: string
  }
  ```
- **Response:** `{ id: string; createdAt: string; }`
- **Frontend usage:** Not yet implemented; reserved for a "Report a price" button.

---

### Community Feed (Alerts, Suppliers, Buyers)

These endpoints do **not** require authentication for reading; posting may require auth (future).

#### `GET /community/posts`
**Fetch community posts (real-time feed of alerts, suppliers, buyers).**

- **Query Params:**
  - `type?: "alert" | "supplier" | "buyer" | "general"` (optional filter)
  - `market?: string` (optional; filter by association/market)
  - `limit?: number` (default: 50)
  - `offset?: number` (default: 0)
  - `since?: string` (optional; ISO 8601; return posts created after this timestamp)
- **Response:**
  ```json
  {
    posts: [CommunityPost],
    total: number
  }
  ```
- **Frontend usage:** Community page calls this with optional `type` filter to show the feed.
- **Real-time:** For a true real-time feed, consider a WebSocket endpoint or Server-Sent Events:
  - `WebSocket wss://api.sabimarket.com/community/posts/stream?since=<ISO8601>`
  - Or implement polling: frontend retries every 30–60 seconds with `since` param to fetch only new posts.

#### `POST /community/posts`
**Create a new community post (for future "New post" button).**

- **Body:**
  ```json
  {
    message: string,
    type: "alert" | "supplier" | "buyer" | "general"
  }
  ```
- **Response:** `CommunityPost`
- **Frontend usage:** Community page has a "+" button (currently no-op); wire this to a modal to create posts.
- **Auth:** May require authentication; associate the post with the logged-in user's name and market.

#### `DELETE /community/posts/:id` (Future)
**Delete a post (allow authors to remove their own posts).**

- **Response:** `{ success: true; }`

---

### AI Transcription & Parsing (Voice Processing)

These endpoints should be **fast** and work offline-capable (or provide a fallback).

#### `POST /ai/transcribe`
**Transcribe audio (server-side transcription for consistency).**

- **Body:** FormData with audio file
  ```
  multipart/form-data
  - audio: File (WAV, MP3, OGG, or WebM)
  - language?: "en-NG" | "yo" | etc. (default: "en-NG")
  ```
- **Response:**
  ```json
  {
    transcript: string,
    confidence?: number
  }
  ```
- **Frontend usage:** Not currently used; the app uses the browser's `SpeechRecognition` API. However, for consistency across devices and better Pidgin/Yoruba support, you could replace the browser API with this endpoint.
- **Recommended service:** Whisper API (OpenAI), Google Cloud Speech-to-Text, or an open-source model (Whisper, Vosk).

#### `POST /ai/parse`
**Parse a transcript into structured transaction clauses (the parsing logic).**

- **Body:**
  ```json
  {
    transcript: string,
    language?: "english" | "pidgin" (default: "english")
  }
  ```
- **Response:**
  ```json
  {
    clauses: [
      {
        kind: "buy" | "sell",
        quantity: number,
        item: string,
        unit: string,
        amount: number
      }
    ]
  }
  ```
- **Frontend usage:** Voice Recorder component calls this after recording stops. The clauses are shown to the user for editing before final save (see `POST /transactions`).
- **Implementation:** Replace the regex parser in `lib/parseTransaction.ts` with an API call to this endpoint. You can use:
  - A fine-tuned LLM (as mentioned in the pitch: Grok, Llama, Mistral, etc.).
  - GPT-4 with a system prompt instructing structured output.
  - A custom NER (Named Entity Recognition) model trained on market transaction language.
- **Fallback:** If the endpoint is unavailable, fall back to the client-side regex parser in `lib/parseTransaction.ts` so the app still works offline.

---

### Sync & Offline (Background Sync Queue)

#### `POST /sync/transactions`
**Bulk upload transactions that failed to sync (for offline resilience).**

- **Body:**
  ```json
  {
    transactions: [Transaction]
  }
  ```
- **Response:**
  ```json
  {
    synced: [{ id: string }],
    failed: [{ id: string; error: string }]
  }
  ```
- **Frontend usage:**
  - Not currently implemented; reserved for a background sync queue.
  - When `navigator.onOnline` fires, the app should automatically call this endpoint with all `synced: false` transactions.
  - The endpoint returns which IDs succeeded; frontend updates store to mark them `synced: true`.
- **Implementation note:** This is where you'd implement retry logic, conflict resolution, etc. Consider using Background Sync API or a queue library like `rdb` (Reactive Database).

#### `GET /sync/status`
**Check sync status (pending transactions count, last sync time, etc.).**

- **Response:**
  ```json
  {
    pending: number,
    lastSyncAt?: string,
    isOnline: boolean
  }
  ```
- **Frontend usage:** Settings page displays "Sync status" indicator; could call this periodically or on demand.

---

### User Settings & Preferences

#### `GET /user/me`
**Fetch current user profile.**

- **Response:** `User`
- **Frontend usage:** Not yet used; reserved for once auth is implemented. Could populate Settings page with user info.

#### `PATCH /user/me`
**Update user preferences.**

- **Body:**
  ```json
  {
    language?: "english" | "pidgin",
    market?: string,
    name?: string,
    phone?: string,
    email?: string
  }
  ```
- **Response:** `User`
- **Frontend usage:** Settings page has a language toggle; this could eventually sync that to the backend.
- **Note:** The frontend currently stores language in Zustand's `language` state with localStorage persistence. Once auth exists, move this to the backend.

#### `POST /user/reset` (Future)
**Reset user data (clear all transactions and reset to demo state).**

- **Body:** `{}`
- **Response:** `{ success: true; transactions: [demo transactions]; }`
- **Frontend usage:** Settings page has "Reset demo data" button; wire this to call the endpoint instead of just clearing local state.

---

### Error Handling & Status Codes

All endpoints should return standard HTTP status codes:

- **200 OK** — successful GET or PATCH
- **201 Created** — successful POST
- **204 No Content** — successful DELETE
- **400 Bad Request** — invalid input (e.g., missing required fields, invalid data types)
- **401 Unauthorized** — missing or invalid auth token
- **403 Forbidden** — user lacks permission (e.g., trying to delete another user's post)
- **404 Not Found** — resource does not exist
- **429 Too Many Requests** — rate limit exceeded (consider implementing to prevent abuse)
- **500 Internal Server Error** — server error
- **503 Service Unavailable** — server is down (frontend will treat like network error and retry)

Error response format (suggested):

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {}
}
```

Example:

```json
{
  "error": "PARSE_ERROR",
  "message": "Could not parse transcript. Please try again.",
  "details": { "transcript_length": 5 }
}
```

---

### Implementation Checklist

1. **Authentication** *(for future)*
   - [ ] `POST /auth/register` — sign up new traders
   - [ ] `POST /auth/login` — log in existing traders
   - [ ] `POST /auth/logout` — end session

2. **Transactions (MVP)**
   - [ ] `POST /transactions` — save voice-recorded transactions
   - [ ] `GET /transactions` — fetch user's ledger (paginated, filterable)
   - [ ] `POST /sync/transactions` — offline sync queue

3. **Market Prices (MVP)**
   - [ ] `GET /market/prices` — fetch crowdsourced prices
   - [ ] Aggregation logic to infer prices from transaction history

4. **Community Feed (MVP)**
   - [ ] `GET /community/posts` — fetch alerts/supplier/buyer feed
   - [ ] Optional: WebSocket or Server-Sent Events for real-time updates

5. **AI Parsing (MVP)**
   - [ ] `POST /ai/parse` — parse transcript into structured transactions
   - [ ] Fallback: ensure client-side regex parser works when endpoint unavailable

6. **User Preferences**
   - [ ] `GET /user/me` — fetch user profile
   - [ ] `PATCH /user/me` — update language, market, etc.

7. **Offline & Resilience**
   - [ ] All endpoints should handle network errors gracefully
   - [ ] Frontend retries failed requests when `navigator.onOnline` is `true`
   - [ ] Consider 5xx status codes as retriable; 4xx codes as non-retriable

---

### Frontend Integration Code Examples

**Fetching transactions (dashboard):**

```typescript
// app/page.tsx (once backend is ready)
const transactions = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/transactions?limit=50`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());
```

**Parsing a transcript:**

```typescript
// components/VoiceRecorder.tsx
const { clauses } = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/ai/parse`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript: finalTranscript, language })
  }
).then(r => r.json());
```

**Saving transactions with offline fallback:**

```typescript
// lib/store.ts (inside addTransactions action)
try {
  const { saved } = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: txns })
    }
  ).then(r => r.json());
  
  // Mark as synced
  store.dispatch(markSynced(saved.map(t => t.id)));
} catch (err) {
  // Network error — keep synced: false, store will retry later
  console.log("Offline; will sync when online.", err);
}
```

---

## Known gaps / next steps

- No auth, no real backend — by design, per the brief. Use the above spec to build the backend.
- `SpeechRecognition` is not a web standard and support varies; implement the `/ai/transcribe` and `/ai/parse` endpoints for consistent transcription across devices, especially for Pidgin accuracy.
- Icons in `public/icons/` are placeholders generated for this scaffold — swap in real branded icons before shipping.
- No automated tests yet.
- Price aggregation logic (crowdsourcing, external APIs) is not defined; design this carefully to ensure data accuracy and prevent spam.
