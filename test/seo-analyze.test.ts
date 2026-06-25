import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeSeo,
  slugify,
  countSyllables,
  fleschReadingEase,
  type SeoInput,
} from "../features/content-os/seo-writer/utils/seo.ts";

test("slugify produces clean url slugs", () => {
  assert.equal(slugify("Cold Email Automation: The 2026 Playbook!"), "cold-email-automation-the-2026-playbook");
  assert.equal(slugify("  Hello   World  "), "hello-world");
});

test("syllable heuristic is roughly correct", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("automation"), 4);
  assert.ok(countSyllables("readability") >= 4);
});

test("flesch is higher for simple text", () => {
  const simple = fleschReadingEase("The cat sat. The dog ran. We had fun.");
  const complex = fleschReadingEase(
    "Notwithstanding the aforementioned considerations, the implementation necessitates substantial architectural reconfiguration.",
  );
  assert.ok(simple > complex);
});

test("density and keyword checks reflect placement", () => {
  const input: SeoInput = {
    focusKeyword: "cold email",
    title: "Cold Email Playbook for Modern Sales Teams Today",
    metaDescription:
      "A practical guide to cold email outreach that books replies, covering frameworks, cadence, follow-ups, and the metrics that actually matter.",
    body: "# Cold Email\n\nCold email is a channel. " + "This guide explains cold email well. ".repeat(40),
  };
  const r = analyzeSeo(input);
  assert.ok(r.keywordCount > 0);
  assert.ok(r.density > 0);
  assert.ok(r.score > 50);
  assert.equal(r.checks.length, 8);
});

test("empty input fails gracefully (no NaN)", () => {
  const r = analyzeSeo({ focusKeyword: "", title: "", metaDescription: "", body: "" });
  assert.equal(r.wordCount, 0);
  assert.equal(r.density, 0);
  assert.ok(Number.isFinite(r.readability));
  assert.ok(r.score >= 0 && r.score <= 100);
});
