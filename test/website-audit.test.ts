import { test } from "node:test";
import assert from "node:assert/strict";
import { auditSite, type AuditInput } from "../features/growth-os/website-health/utils/audit.ts";

const good: AuditInput = {
  lcp: 1.8, inp: 120, cls: 0.05, ttfb: 200,
  pageWeightKb: 800, requests: 30,
  https: true, mobileFriendly: true, hasMetaDescription: true,
  hasH1: true, hasAltText: true, hasSitemap: true,
};

test("a healthy site grades A with no recommendations", () => {
  const r = auditSite(good);
  assert.equal(r.grade, "A");
  assert.equal(r.cwv.lcp, "good");
  assert.equal(r.recommendations.length, 0);
});

test("poor vitals downgrade and generate high-priority fixes", () => {
  const r = auditSite({ ...good, lcp: 5, cls: 0.4, https: false });
  assert.equal(r.cwv.lcp, "poor");
  assert.equal(r.cwv.cls, "poor");
  assert.ok(r.overall < auditSite(good).overall);
  assert.ok(r.recommendations.some((x) => x.priority === "high"));
  // high-priority recs sort first
  assert.equal(r.recommendations[0].priority, "high");
});

test("missing best practices lower the SEO score", () => {
  const r = auditSite({ ...good, hasMetaDescription: false, hasSitemap: false, hasAltText: false });
  assert.ok(r.seoScore < 100);
});

test("scores stay within 0..100", () => {
  const r = auditSite({ ...good, lcp: 99, inp: 9999, cls: 9, pageWeightKb: 99999, requests: 9999 });
  for (const v of [r.perfScore, r.seoScore, r.overall]) {
    assert.ok(v >= 0 && v <= 100);
  }
});
