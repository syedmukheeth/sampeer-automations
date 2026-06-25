import { expenseInputSchema, type ExpenseInput } from "./schema.js";

export interface ValidationResult {
  success: boolean;
  errors: string[];
  data?: ExpenseInput;
}

/**
 * Deterministic input validation. If anything required is missing/invalid,
 * return errors and DO NOT produce a report.
 */
export function validateInput(raw: unknown): ValidationResult {
  const parsed = expenseInputSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => {
      const path = i.path.join(".") || "(root)";
      return `${path}: ${i.message}`;
    });
    return { success: false, errors };
  }

  const data = parsed.data;
  const errors: string[] = [];
  const req = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
  };

  req(!!data.report.name.trim(), "Report Name is required");
  req(isDate(data.report.periodStart), "Valid Period Start is required");
  req(isDate(data.report.periodEnd), "Valid Period End is required");
  req(!!data.report.currency.trim(), "Currency is required");
  req(data.transactions.length >= 1, "At least one transaction is required");

  if (isDate(data.report.periodStart) && isDate(data.report.periodEnd)) {
    req(
      new Date(data.report.periodEnd) >= new Date(data.report.periodStart),
      "Period End cannot be before Period Start",
    );
  }

  data.transactions.forEach((t, idx) => {
    req(isDate(t.date), `Transaction ${idx + 1}: valid date is required`);
    req(Number.isFinite(t.amount), `Transaction ${idx + 1}: amount must be a number`);
    req(!!t.description.trim(), `Transaction ${idx + 1}: description is required`);
  });

  return errors.length
    ? { success: false, errors }
    : { success: true, errors: [], data };
}

function isDate(s: string): boolean {
  if (!s) return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}
