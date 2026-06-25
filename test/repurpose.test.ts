import { test } from "node:test";
import assert from "node:assert/strict";
import {
  splitSentences,
  buildThread,
  buildSummary,
  buildLinkedin,
  repurpose,
} from "../features/content-os/repurpose-engine/utils/repurpose.ts";

const SAMPLE =
  "Cold email still works in 2026. The trick is relevance, not volume. " +
  "Most teams blast generic templates and wonder why nobody replies. " +
  "Personalize the first line, lead with their problem, and keep it short. " +
  "Follow up three times before giving up. That cadence books real meetings.";

test("splitSentences breaks on terminal punctuation", () => {
  const s = splitSentences(SAMPLE);
  assert.ok(s.length >= 5);
  assert.ok(s.every((x) => x.length > 0));
});

test("thread posts stay under the limit and are numbered", () => {
  const thread = buildThread(SAMPLE, 270);
  assert.ok(thread.length >= 1);
  assert.ok(thread.every((t) => t.length <= 270));
  assert.match(thread[0], /\(1\/\d+\)$/);
});

test("very long sentence is truncated to fit", () => {
  const long = "word ".repeat(200).trim() + ".";
  const thread = buildThread(long, 270);
  assert.ok(thread.every((t) => t.length <= 270));
});

test("summary returns first sentence plus up to 3 more, in order", () => {
  const sum = buildSummary(SAMPLE);
  assert.ok(sum.length >= 1 && sum.length <= 4);
  assert.equal(sum[0], splitSentences(SAMPLE)[0]);
});

test("linkedin includes handle in CTA when provided", () => {
  const post = buildLinkedin(SAMPLE, { handle: "@sampeer" });
  assert.ok(post.includes("@sampeer"));
});

test("empty input yields empty outputs without throwing", () => {
  const out = repurpose("");
  assert.deepEqual(out.thread, []);
  assert.deepEqual(out.summary, []);
  assert.equal(out.linkedin, "");
});
