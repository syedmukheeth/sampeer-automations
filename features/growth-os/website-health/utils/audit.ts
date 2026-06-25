/**
 * Website health audit - pure, deterministic TypeScript. Instant (no LLM, no
 * crawl). Scores Core Web Vitals against Google's thresholds plus an on-page
 * SEO/best-practice checklist, then rolls up to a letter grade with prioritized
 * recommendations. Unit-tested. (A live-crawl upgrade can feed real Lighthouse
 * metrics into the same scoring.)
 */

export interface AuditInput {
  lcp: number; // Largest Contentful Paint, seconds
  inp: number; // Interaction to Next Paint, ms
  cls: number; // Cumulative Layout Shift, unitless
  ttfb: number; // Time To First Byte, ms
  pageWeightKb: number;
  requests: number;
  https: boolean;
  mobileFriendly: boolean;
  hasMetaDescription: boolean;
  hasH1: boolean;
  hasAltText: boolean;
  hasSitemap: boolean;
}

export type Rating = "good" | "needs-improvement" | "poor";

export interface AuditResult {
  cwv: { lcp: Rating; inp: Rating; cls: Rating };
  perfScore: number; // 0-100
  seoScore: number; // 0-100
  overall: number; // 0-100
  grade: string; // A-F
  recommendations: { priority: "high" | "medium" | "low"; text: string }[];
}

const RATING_POINTS: Record<Rating, number> = { good: 100, "needs-improvement": 60, poor: 25 };

function rate(value: number, good: number, poor: number): Rating {
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function grade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function auditSite(input: AuditInput): AuditResult {
  const lcp = rate(input.lcp, 2.5, 4.0);
  const inp = rate(input.inp, 200, 500);
  const cls = rate(input.cls, 0.1, 0.25);

  // Performance = CWV (75%) + a lightweight payload signal (25%).
  const cwvScore = (RATING_POINTS[lcp] + RATING_POINTS[inp] + RATING_POINTS[cls]) / 3;
  const weightScore = clamp(100 - Math.max(0, input.pageWeightKb - 1000) / 30, 0, 100);
  const requestScore = clamp(100 - Math.max(0, input.requests - 50) * 1.2, 0, 100);
  const perfScore = Math.round(cwvScore * 0.75 + ((weightScore + requestScore) / 2) * 0.25);

  // SEO / best practices checklist.
  const checks = [
    input.https,
    input.mobileFriendly,
    input.hasMetaDescription,
    input.hasH1,
    input.hasAltText,
    input.hasSitemap,
  ];
  const seoScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const overall = Math.round(perfScore * 0.6 + seoScore * 0.4);

  const recommendations = buildRecs(input, { lcp, inp, cls });

  return {
    cwv: { lcp, inp, cls },
    perfScore,
    seoScore,
    overall,
    grade: grade(overall),
    recommendations,
  };
}

function buildRecs(
  input: AuditInput,
  cwv: { lcp: Rating; inp: Rating; cls: Rating },
): AuditResult["recommendations"] {
  const recs: AuditResult["recommendations"] = [];
  const high = (text: string) => recs.push({ priority: "high", text });
  const med = (text: string) => recs.push({ priority: "medium", text });
  const low = (text: string) => recs.push({ priority: "low", text });

  if (!input.https) high("Serve the site over HTTPS - it's a ranking factor and a trust signal.");
  if (cwv.lcp !== "good") high(`Improve LCP (${input.lcp}s): optimize the hero image, preload key assets, and cut render-blocking CSS.`);
  if (cwv.cls !== "good") high(`Reduce layout shift (CLS ${input.cls}): set width/height on media and reserve space for ads/embeds.`);
  if (cwv.inp !== "good") med(`Improve INP (${input.inp}ms): break up long tasks and defer non-critical JavaScript.`);
  if (!input.mobileFriendly) high("Make the site mobile-friendly - most traffic and indexing is mobile-first.");
  if (input.pageWeightKb > 2000) med(`Trim page weight (${input.pageWeightKb}KB): compress images and enable text compression.`);
  if (input.requests > 80) med(`Cut request count (${input.requests}): bundle assets and lazy-load below-the-fold content.`);
  if (!input.hasMetaDescription) med("Add a meta description to improve click-through from search.");
  if (!input.hasH1) med("Add a single descriptive H1 to every page.");
  if (!input.hasAltText) low("Add alt text to images for accessibility and image SEO.");
  if (!input.hasSitemap) low("Publish an XML sitemap and submit it in Search Console.");

  const order = { high: 0, medium: 1, low: 2 } as const;
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
