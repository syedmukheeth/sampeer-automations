import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../features/sales-os/meeting-summary/utils/summarize.ts";

const NOTES = `Alex: Thanks everyone for joining the Q3 planning call.
Jordan: We reviewed the pipeline and it looks healthy.
Alex: We agreed to launch the new pricing on August 1.
Jordan: I will send the updated deck by Friday.
Sam: Should we include the enterprise tier in this round?
Alex: Let's schedule a follow-up to finalize the enterprise plan.`;

test("extracts speakers from tags", () => {
  const r = summarize(NOTES);
  assert.deepEqual(r.speakers.sort(), ["Alex", "Jordan", "Sam"]);
});

test("captures action items with owners", () => {
  const r = summarize(NOTES);
  const texts = r.actionItems.map((a) => a.text.toLowerCase());
  assert.ok(texts.some((t) => t.includes("send the updated deck")));
  const deck = r.actionItems.find((a) => a.text.toLowerCase().includes("send the updated deck"));
  assert.equal(deck?.owner, "Jordan");
});

test("captures decisions and questions", () => {
  const r = summarize(NOTES);
  assert.ok(r.decisions.some((d) => d.toLowerCase().includes("agreed")));
  assert.ok(r.questions.some((q) => q.endsWith("?")));
});

test("summary is non-empty and bounded", () => {
  const r = summarize(NOTES);
  assert.ok(r.summary.length >= 1 && r.summary.length <= 4);
});

test("empty input yields empty structures", () => {
  const r = summarize("");
  assert.deepEqual(r.actionItems, []);
  assert.deepEqual(r.speakers, []);
  assert.equal(r.wordCount, 0);
});
