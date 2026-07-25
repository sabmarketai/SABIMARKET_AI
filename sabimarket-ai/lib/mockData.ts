import { CommunityPost, MarketPrice, Transaction } from "./types";

// --- FILLER DATA -----------------------------------------------------------
// Everything below stands in for what the backend will eventually provide:
// - transactions: normally read/written via Firestore or your API
// - marketPrices: normally aggregated from crowdsourced reports + a price API
// - communityPosts: normally a real-time feed (Firestore listener / websocket)
// Swap the functions in lib/api.ts to fetch real data and these constants
// become unnecessary. See README.md "Where the backend plugs in".
// -----------------------------------------------------------------------------

export const seedTransactions: Transaction[] = [
  {
    id: "t1",
    kind: "buy",
    item: "Oranges",
    quantity: 50,
    unit: "pieces",
    amount: 5000,
    market: "Mile 12 Market",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    synced: true,
    transcript: "I buy 50 oranges for 5k",
  },
  {
    id: "t2",
    kind: "sell",
    item: "Oranges",
    quantity: 2,
    unit: "pieces",
    amount: 200,
    market: "Mile 12 Market",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    synced: true,
    transcript: "sell 2 for 200 naira today",
  },
  {
    id: "t3",
    kind: "sell",
    item: "Tomatoes basket",
    quantity: 1,
    unit: "basket",
    amount: 18000,
    market: "Mile 12 Market",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    synced: false,
  },
  {
    id: "t4",
    kind: "buy",
    item: "Pure water",
    quantity: 10,
    unit: "bags",
    amount: 3500,
    market: "Ojota Market",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    synced: false,
  },
];

export const seedMarketPrices: MarketPrice[] = [
  {
    id: "p1",
    item: "Tomatoes",
    market: "Mile 12 Market",
    pricePerUnit: 15000,
    unit: "basket",
    trend: "down",
    changePercent: 12,
    note: "Tomatoes dey cheap for Mile 12 today — go now before rain.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "p2",
    item: "Pepper",
    market: "Ile-Epo Market",
    pricePerUnit: 22000,
    unit: "basket",
    trend: "up",
    changePercent: 8,
    note: "Price still rising, small supply this week.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "p3",
    item: "Garri",
    market: "Mushin Market",
    pricePerUnit: 1200,
    unit: "paint rubber",
    trend: "flat",
    changePercent: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "p4",
    item: "Oranges",
    market: "Mile 12 Market",
    pricePerUnit: 90,
    unit: "piece",
    trend: "down",
    changePercent: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: "c1",
    authorName: "Iya Bose",
    associationName: "Mile 12 Traders Union",
    message:
      "Make everybody sabi say NURTW dey collect extra toll for gate 3 today. Use gate 1 make e cheap for una.",
    type: "alert",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "c2",
    authorName: "Chukwudi Motors",
    associationName: "Ojota Market Association",
    message: "I get fresh tomatoes wey I wan sell wholesale. 20 baskets available.",
    type: "supplier",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "c3",
    authorName: "Mama Ngozi",
    associationName: "Mushin Market Women",
    message: "Looking for garri supplier, need 30 paint rubber before Friday.",
    type: "buyer",
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
];
