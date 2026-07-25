# SabiMarket AI — Next.js PWA

Voice-first market assistant for Nigerian informal traders. This is a
frontend-complete scaffold: real UI, real routing, real voice capture, real
offline shell, with mock data standing in for the backend you'll add later.

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

## Known gaps / next steps

- No auth, no real backend — by design, per the brief.
- `SpeechRecognition` is not a web standard and support varies; consider a
  server-side Whisper-style endpoint for consistent transcription across
  devices, especially for Pidgin accuracy.
- Icons in `public/icons/` are placeholders generated for this scaffold —
  swap in real branded icons before shipping.
- No automated tests yet.
