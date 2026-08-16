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

function toClauses(transactions: BackendTransaction[]): ParsedClause[] {
  return transactions.map((t) => ({
    kind: t.action,
    quantity: t.quantity,
    item: t.item,
    unit: t.unit || "pieces",
    amount: t.amount,
  }));
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
      // Render's free tier can take 50+ seconds to wake from an idle spin-down,
      // so a short timeout here would fall back to the local parser on almost
      // every cold request.
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;

    const data: BackendResponse = await res.json();
    return toClauses(data.transactions);
  } catch {
    return null;
  }
}

/**
 * Sends recorded audio to the AI backend for Whisper transcription + extraction —
 * used when the browser has no built-in speech recognition (e.g. many mobile
 * WebViews). Returns null on any failure so the caller can fall back gracefully.
 */
export async function transcribeAudioRemote(
  audio: Blob,
): Promise<{ transcript: string; clauses: ParsedClause[] } | null> {
  try {
    const formData = new FormData();
    formData.append("audio", audio, "recording.webm");

    const res = await fetch(`${API_BASE_URL}/api/v1/voice/voice-transaction`, {
      method: "POST",
      body: formData,
      // Whisper transcription plus a possible Render cold-start can take a while.
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;

    const data: BackendResponse = await res.json();
    return { transcript: data.transcript, clauses: toClauses(data.transactions) };
  } catch {
    return null;
  }
}
