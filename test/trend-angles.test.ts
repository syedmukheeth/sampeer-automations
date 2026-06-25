import { test } from "node:test";
import assert from "node:assert/strict";
import { generateAngles, scoreHeadline } from "../features/content-os/trend-hunter/utils/angles.ts";

test("generates 8 angles sorted by score descending", () => {
  const a = generateAngles({ niche: "B2B sales", keyword: "cold email", audience: "founders" });
  assert.equal(a.length, 8);
  for (let i = 1; i < a.length; i++) {
    assert.ok(a[i - 1].score >= a[i].score);
  }
});

test("headline with number + power word scores higher than a bland one", () => {
  const strong = scoreHeadline("7 Proven Cold Email Tactics That Work in 2026");
  const weak = scoreHeadline("cold email");
  assert.ok(strong > weak);
});

test("score is bounded 0..100", () => {
  for (const a of generateAngles({ niche: "x", keyword: "y", audience: "z" })) {
    assert.ok(a.score >= 0 && a.score <= 100);
  }
});

test("empty input still produces usable angles", () => {
  const a = generateAngles({ niche: "", keyword: "", audience: "" });
  assert.equal(a.length, 8);
  assert.ok(a.every((x) => x.headline.length > 5));
});
