import { Transaction, TransactionKind } from "./types";

/**
 * FILLER LOGIC — stands in for the real AI parsing described in the pitch
 * ("AI transcribes, logs inventory, and calculates profit automatically").
 *
 * In production this function's job moves server-side: send the transcript
 * to an LLM (the pitch names Grok / an open-source model) with a structured
 * output prompt and get back typed transactions. See README.md.
 *
 * For now this does simple pattern-matching so the flow is demoable without
 * a backend. It understands sentences like:
 *   "I buy 50 oranges for 5k"
 *   "sell 2 oranges for 200 naira today"
 *   "I sell one basket of tomatoes for 18000"
 */

const NUMBER_WORD: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseAmount(raw: string): number {
  const cleaned = raw.toLowerCase().replace(/,/g, "").trim();
  const kMatch = cleaned.match(/^(\d+(\.\d+)?)k$/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

function parseQuantity(raw: string): number {
  const cleaned = raw.toLowerCase().trim();
  if (NUMBER_WORD[cleaned] !== undefined) return NUMBER_WORD[cleaned];
  const num = parseInt(cleaned, 10);
  return Number.isNaN(num) ? 1 : num;
}

export interface ParsedClause {
  kind: TransactionKind;
  quantity: number;
  item: string;
  unit: string;
  amount: number;
}

const CLAUSE_REGEX =
  /\b(buy|bought|sell|sold|dey sell|dey buy)\b\s+(?:(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(?:of\s+)?([a-z\s]+?)\s+for\s+([\d,.]+k?)/gi;

export function parseTranscript(transcript: string): ParsedClause[] {
  const clauses: ParsedClause[] = [];
  const text = transcript.toLowerCase();
  let match: RegExpExecArray | null;
  const regex = new RegExp(CLAUSE_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const [, verbRaw, qtyRaw, itemRaw, amountRaw] = match;
    const kind: TransactionKind = verbRaw.includes("sell") ? "sell" : "buy";
    const quantity = qtyRaw ? parseQuantity(qtyRaw) : 1;
    const amount = parseAmount(amountRaw);

    // Try to split a leading unit word ("basket of tomatoes" -> unit basket)
    let item = itemRaw.trim();
    let unit = "pieces";
    const unitMatch = item.match(/^(basket|bag|bags|baskets|piece|pieces|paint rubber|rubber|crate|crates)\s+(.*)$/);
    if (unitMatch) {
      unit = unitMatch[1];
      item = unitMatch[2] || item;
    }
    item = item.replace(/\btoday\b/g, "").trim();

    clauses.push({ kind, quantity, item: capitalize(item), unit, amount });
  }

  return clauses;
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function clausesToTransactions(
  clauses: ParsedClause[],
  market: string,
  transcript: string
): Transaction[] {
  return clauses.map((c, i) => ({
    id: `voice-${Date.now()}-${i}`,
    kind: c.kind,
    item: c.item || "Item",
    quantity: c.quantity,
    unit: c.unit,
    amount: c.amount,
    market,
    createdAt: new Date().toISOString(),
    synced: false,
    transcript,
  }));
}
