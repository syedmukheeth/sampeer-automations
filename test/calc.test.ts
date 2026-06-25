import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, round2 } from "../features/business-os/invoice-generator/utils/calc.ts";
import type { InvoiceInput } from "../features/business-os/invoice-generator/utils/schema.ts";

function base(overrides: Partial<InvoiceInput> = {}): InvoiceInput {
  return {
    company: { name: "Sampeer", address: "X" },
    client: { name: "Acme", email: "a@acme.com" },
    project: { name: "Site" },
    invoice: { number: "INV-1", issueDate: "2026-06-01", dueDate: "2026-06-15" },
    currency: "USD",
    items: [
      { name: "Website", quantity: 1, unitPrice: 1000 },
      { name: "SEO", quantity: 2, unitPrice: 250 },
    ],
    ...overrides,
  } as InvoiceInput;
}

test("round2 avoids float drift", () => {
  assert.equal(round2(0.1 + 0.2), 0.3);
  assert.equal(round2(1000.005), 1000.01);
});

test("subtotal sums line totals", () => {
  const t = computeTotals(base());
  assert.equal(t.subtotal, 1500); // 1000 + 2*250
});

test("percent discount then tax, in order", () => {
  const t = computeTotals(
    base({ discount: { type: "percent", value: 10 }, tax: { rate: 18 } }),
  );
  assert.equal(t.discount, 150); // 10% of 1500
  assert.equal(t.tax, 243); // 18% of (1500-150)=1350
  assert.equal(t.total, 1593); // 1350 + 243
});

test("fixed discount is capped at subtotal", () => {
  const t = computeTotals(base({ discount: { type: "fixed", value: 9999 } }));
  assert.equal(t.discount, 1500);
  assert.equal(t.total, 0);
});

test("remaining = total - paid", () => {
  const t = computeTotals(base({ amountPaid: 500 }));
  assert.equal(t.remaining, 1000);
});
