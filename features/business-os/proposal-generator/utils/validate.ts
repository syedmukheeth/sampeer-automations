import { proposalInputSchema, type ProposalInput } from "./schema.js";

export interface ValidationResult {
  success: boolean;
  errors: string[];
  data?: ProposalInput;
}

/**
 * Step 1 - Validate Input. Deterministic. If anything required is missing,
 * return errors and DO NOT generate a proposal.
 */
export function validateInput(raw: unknown): ValidationResult {
  const parsed = proposalInputSchema.safeParse(raw);
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

  req(!!data.company.name.trim(), "Company Name is required");
  req(!!data.company.address.trim(), "Company Address is required");
  req(!!data.client.name.trim(), "Client Name is required");
  req(isEmail(data.client.email), "Valid Client Email is required");
  req(!!data.proposal.title.trim(), "Proposal Title is required");
  req(!!data.proposal.number.trim(), "Proposal Number is required");
  req(isDate(data.proposal.date), "Valid Proposal Date is required");
  req(isDate(data.proposal.validUntil), "Valid 'Valid Until' date is required");
  req(!!data.currency.trim(), "Currency is required");
  req(!!data.project.name.trim(), "Project Name is required");
  req(data.items.length >= 1, "At least one investment item is required");

  data.items.forEach((it, idx) => {
    req(it.quantity > 0, `Item ${idx + 1}: Quantity must be greater than 0`);
    req(it.unitPrice >= 0, `Item ${idx + 1}: Unit Price is required`);
    req(!!it.name.trim(), `Item ${idx + 1}: Name is required`);
  });

  if (isDate(data.proposal.date) && isDate(data.proposal.validUntil)) {
    req(
      new Date(data.proposal.validUntil) >= new Date(data.proposal.date),
      "'Valid Until' cannot be before the proposal date",
    );
  }

  return errors.length
    ? { success: false, errors }
    : { success: true, errors: [], data };
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isDate(s: string): boolean {
  if (!s) return false;
  return !Number.isNaN(new Date(s).getTime());
}
