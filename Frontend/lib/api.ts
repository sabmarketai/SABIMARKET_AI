import { ParsedClause } from "./parseTransaction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.13:8123";

interface BackendTransaction {
  action: "buy" | "sell";
  item: string;
  quantity: number;
  unit: string | null;
  amount: number;
  currency: string;
}

interface BackendResponse {
  transcript: string;
  date: string;
  transactions: BackendTransaction[];
}

/**
 * Sends a transcript to the AI backend for structured extraction.
 * Returns null on any failure (offline, server down, bad response) so the
 * caller can fall back to the local regex parser — the app must keep
 * working offline.
 */
export async function extractTranscriptRemote(transcript: string): Promise<ParsedClause[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/voice/extract-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data: BackendResponse = await res.json();
    return data.transactions.map((t) => ({
      kind: t.action,
      quantity: t.quantity,
      item: t.item,
      unit: t.unit || "pieces",
      amount: t.amount,
    }));
  } catch {
    return null;
  }
}
