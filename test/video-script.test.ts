import { test } from "node:test";
import assert from "node:assert/strict";
import { buildScript, type ScriptInput } from "../features/content-os/video-factory/utils/script.ts";

const base: ScriptInput = {
  topic: "Cold Email Automation",
  audience: "solo founders",
  durationMin: 9,
  tone: "educational",
  platform: "youtube",
};

test("produces titles, hook, sections, shot list", () => {
  const s = buildScript(base);
  assert.ok(s.titles.length >= 3);
  assert.ok(s.hook.length > 10);
  assert.ok(s.sections.length >= 3);
  assert.ok(s.shotList.length >= 3);
});

test("word target scales with duration", () => {
  const short = buildScript({ ...base, durationMin: 2 }).wordTarget;
  const long = buildScript({ ...base, durationMin: 18 }).wordTarget;
  assert.ok(long > short);
});

test("short-form platform uses a tight 3-beat structure", () => {
  const shorts = buildScript({ ...base, platform: "shorts" });
  assert.equal(shorts.sections.length, 3);
  assert.match(shorts.sections[0].heading, /Pattern interrupt/);
});

test("tone changes the hook", () => {
  const edu = buildScript({ ...base, tone: "educational" }).hook;
  const promo = buildScript({ ...base, tone: "promotional" }).hook;
  assert.notEqual(edu, promo);
});
