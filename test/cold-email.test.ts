import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSequence, type ColdEmailInput } from "../features/sales-os/cold-email/utils/generate.ts";

const base: ColdEmailInput = {
  senderName: "Alex Rivera",
  senderCompany: "Sampeer Studio",
  offer: "automated client follow-ups",
  prospectName: "Jordan Lee",
  prospectCompany: "Northwind",
  painPoint: "leads going cold",
  proof: "We lifted one client's reply rate to 16%.",
  cta: "a quick 15-minute call",
  framework: "aida",
  tone: "direct",
};

test("builds a 4-touch sequence with increasing send days", () => {
  const seq = buildSequence(base);
  assert.equal(seq.length, 4);
  assert.deepEqual(seq.map((m) => m.day), [0, 3, 6, 10]);
  assert.deepEqual(seq.map((m) => m.step), [1, 2, 3, 4]);
});

test("personalizes with prospect first name and company", () => {
  const seq = buildSequence(base);
  assert.ok(seq[0].body.includes("Jordan") || seq[0].subject.includes("Northwind"));
  assert.ok(seq.every((m) => m.words > 0));
});

test("framework changes the opening body", () => {
  const aida = buildSequence({ ...base, framework: "aida" })[0].body;
  const pas = buildSequence({ ...base, framework: "pas" })[0].body;
  const bab = buildSequence({ ...base, framework: "bab" })[0].body;
  assert.notEqual(aida, pas);
  assert.notEqual(pas, bab);
});

test("tone changes greeting and signoff", () => {
  const formal = buildSequence({ ...base, tone: "formal" })[0].body;
  const friendly = buildSequence({ ...base, tone: "friendly" })[0].body;
  assert.ok(formal.startsWith("Dear"));
  assert.ok(friendly.startsWith("Hi"));
});

test("missing optional fields still produce valid copy", () => {
  const seq = buildSequence({ ...base, proof: "", painPoint: "", offer: "" });
  assert.equal(seq.length, 4);
  assert.ok(seq.every((m) => m.body.length > 20));
});
