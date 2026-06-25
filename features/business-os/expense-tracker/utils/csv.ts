import type { Transaction } from "./schema";

/**
 * Hand-rolled CSV -> Transaction parser (no dependency). Runs client-side in the
 * form so the trigger payload is clean structured rows (never raw CSV).
 *
 * Handles: quoted fields with embedded commas/quotes, a header row with common
 * column names, and either a single signed `amount` column OR separate
 * `debit`/`credit` columns. `amount` is normalized SIGNED: negative = money out.
 */

export interface ParseResult {
  transactions: Transaction[];
  warnings: string[];
}

const DATE_KEYS = ["date", "posted", "posteddate", "transactiondate", "datetime"];
const DESC_KEYS = ["description", "details", "name", "memo", "narrative", "payee"];
const MERCHANT_KEYS = ["merchant", "payee", "vendor", "counterparty"];
const AMOUNT_KEYS = ["amount", "value", "total"];
const DEBIT_KEYS = ["debit", "withdrawal", "withdrawals", "moneyout", "paidout"];
const CREDIT_KEYS = ["credit", "deposit", "deposits", "moneyin", "paidin"];

export function parseCsv(text: string): ParseResult {
  const warnings: string[] = [];
  const rows = splitRows(text).map(parseLine).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) {
    return { transactions: [], warnings: ["No data rows found in the CSV."] };
  }

  const header = rows[0].map((h) => normalizeKey(h));
  const find = (keys: string[]) => header.findIndex((h) => keys.includes(h));

  const iDate = find(DATE_KEYS);
  const iDesc = find(DESC_KEYS);
  const iMerchant = find(MERCHANT_KEYS);
  const iAmount = find(AMOUNT_KEYS);
  const iDebit = find(DEBIT_KEYS);
  const iCredit = find(CREDIT_KEYS);

  if (iDate === -1) warnings.push("No date column detected (looked for Date/Posted).");
  if (iDesc === -1 && iMerchant === -1)
    warnings.push("No description/merchant column detected.");
  if (iAmount === -1 && iDebit === -1 && iCredit === -1)
    warnings.push("No amount/debit/credit column detected.");

  const transactions: Transaction[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const at = (i: number) => (i >= 0 && i < cells.length ? cells[i].trim() : "");

    const dateRaw = at(iDate);
    const date = toIsoDate(dateRaw);
    const description = at(iDesc) || at(iMerchant) || "(no description)";

    let amount: number | null = null;
    if (iAmount !== -1 && at(iAmount) !== "") {
      amount = toNumber(at(iAmount));
    } else {
      const debit = toNumber(at(iDebit));
      const credit = toNumber(at(iCredit));
      if (debit) amount = -Math.abs(debit);
      else if (credit) amount = Math.abs(credit);
    }

    if (!date || amount === null || Number.isNaN(amount)) {
      warnings.push(`Row ${r + 1} skipped (missing date or amount).`);
      continue;
    }

    transactions.push({
      date,
      description,
      amount,
      merchant: iMerchant !== -1 ? at(iMerchant) || undefined : undefined,
    });
  }

  if (!transactions.length) warnings.push("No usable transactions parsed.");
  return { transactions, warnings };
}

/* ------------------------------- helpers -------------------------------- */

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

/** Split into logical CSV rows, respecting quotes spanning newlines. */
function splitRows(text: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      if (inQuotes && src[i + 1] === '"') {
        cur += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        cur += ch;
      }
    } else if (ch === "\n" && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim() !== "") out.push(cur);
  return out;
}

/** Parse one CSV line into fields (comma-delimited, quote-aware). */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/** Parse a money string ("$1,234.56", "(45.00)", "-12.3") to a number. */
function toNumber(s: string): number {
  if (!s) return NaN;
  const neg = /^\(.*\)$/.test(s.trim()) || s.trim().startsWith("-");
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (cleaned === "") return NaN;
  const n = Number(cleaned);
  return neg ? -n : n;
}

/** Normalize a date cell to ISO yyyy-mm-dd. Accepts common formats. */
function toIsoDate(s: string): string {
  if (!s) return "";
  const native = new Date(s);
  if (!Number.isNaN(native.getTime()) && /\d{4}/.test(s)) {
    return native.toISOString().slice(0, 10);
  }
  // dd/mm/yyyy or mm/dd/yyyy -> assume dd/mm if first part > 12.
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, a, b, y] = m;
    if (y.length === 2) y = `20${y}`;
    const first = Number(a);
    const second = Number(b);
    const day = first > 12 ? first : second > 12 ? second : first;
    const month = first > 12 ? second : first;
    const iso = new Date(Number(y), month - 1, day);
    if (!Number.isNaN(iso.getTime())) return iso.toISOString().slice(0, 10);
  }
  return Number.isNaN(native.getTime()) ? "" : native.toISOString().slice(0, 10);
}
