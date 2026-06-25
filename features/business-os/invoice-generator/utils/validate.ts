import { invoiceInputSchema, type InvoiceInput } from "./schema.js";

export interface ValidationResult {
  success: boolean;
  errors: string[];
  data?: InvoiceInput;
}

/**
 * Step 1 - Validate Input. Deterministic. If anything required is missing,
 * return errors and DO NOT generate an invoice.
 *
 * Required (per spec): company name+address, client name+email, invoice
 * number, issue date, due date, currency, project name, >=1 item with
 * unit price + quantity.
 */
export function validateInput(raw: unknown): ValidationResult {
  const parsed = invoiceInputSchema.safeParse(raw);
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
  req(!!data.invoice.number.trim(), "Invoice Number is required");
  req(isDate(data.invoice.issueDate), "Valid Invoice Date is required");
  req(isDate(data.invoice.dueDate), "Valid Due Date is required");
  req(!!data.currency.trim(), "Currency is required");
  req(!!data.project.name.trim(), "Project Name is required");
  req(data.items.length >= 1, "At least one invoice item is required");

  data.items.forEach((it, idx) => {
    req(it.quantity > 0, `Item ${idx + 1}: Quantity must be greater than 0`);
    req(it.unitPrice >= 0, `Item ${idx + 1}: Unit Price is required`);
    req(!!it.name.trim(), `Item ${idx + 1}: Name is required`);
  });

  // Due date should not precede issue date.
  if (isDate(data.invoice.issueDate) && isDate(data.invoice.dueDate)) {
    req(
      new Date(data.invoice.dueDate) >= new Date(data.invoice.issueDate),
      "Due Date cannot be before Invoice Date",
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
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}
