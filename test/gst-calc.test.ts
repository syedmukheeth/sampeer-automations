import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTax } from "../features/business-os/gst-calculator/utils/calc.ts";

test("exclusive adds tax on top", () => {
  const r = computeTax({ amount: 1000, rate: 18, mode: "exclusive", split: "none", currency: "INR" });
  assert.equal(r.base, 1000);
  assert.equal(r.taxAmount, 180);
  assert.equal(r.total, 1180);
});

test("inclusive back-calculates the base", () => {
  const r = computeTax({ amount: 1180, rate: 18, mode: "inclusive", split: "none", currency: "INR" });
  assert.equal(r.base, 1000);
  assert.equal(r.taxAmount, 180);
  assert.equal(r.total, 1180);
});

test("cgst+sgst split halves the tax", () => {
  const r = computeTax({ amount: 1000, rate: 18, mode: "exclusive", split: "cgst_sgst", currency: "INR" });
  assert.equal(r.cgst, 90);
  assert.equal(r.sgst, 90);
  assert.equal(r.cgst + r.sgst, r.taxAmount);
});

test("igst keeps full tax in one line", () => {
  const r = computeTax({ amount: 1000, rate: 18, mode: "exclusive", split: "igst", currency: "INR" });
  assert.equal(r.igst, 180);
  assert.equal(r.cgst, 0);
});

test("zero rate is a no-op", () => {
  const r = computeTax({ amount: 500, rate: 0, mode: "exclusive", split: "none", currency: "USD" });
  assert.equal(r.taxAmount, 0);
  assert.equal(r.total, 500);
});
