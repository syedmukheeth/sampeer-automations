/**
 * SEO analyzer - pure, deterministic TypeScript. Instant (no LLM, no job).
 * Scores a draft against on-page SEO best practices: title/meta length, keyword
 * placement, density, heading structure, and Flesch reading ease. Every check is
 * explainable and unit-tested - no model, no guessing.
 */

export interface SeoInput {
  focusKeyword: string;
  title: string;
  metaDescription: string;
  body: string;
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface SeoReport {
  slug: string;
  wordCount: number;
  keywordCount: number;
  density: number; // percent
  readability: number; // Flesch reading ease 0-100+
  readabilityLabel: string;
  score: number; // 0-100
  checks: SeoCheck[];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

const words = (s: string): string[] => (s.trim().match(/[A-Za-z0-9']+/g) ?? []);
const sentences = (s: string): string[] =>
  s.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);

/** Heuristic syllable count - vowel groups, with a few common adjustments. */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch reading ease. Higher = easier. ~60-70 is plain English. */
export function fleschReadingEase(text: string): number {
  const w = words(text);
  const sents = sentences(text);
  if (w.length === 0 || sents.length === 0) return 0;
  const syllables = w.reduce((a, word) => a + countSyllables(word), 0);
  const score = 206.835 - 1.015 * (w.length / sents.length) - 84.6 * (syllables / w.length);
  return Math.round(Math.max(0, Math.min(120, score)) * 10) / 10;
}

function readabilityLabel(score: number): string {
  if (score >= 70) return "Easy";
  if (score >= 50) return "Moderate";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

const STATUS_WEIGHT: Record<CheckStatus, number> = { pass: 1, warn: 0.5, fail: 0 };

export function analyzeSeo(input: SeoInput): SeoReport {
  const kw = input.focusKeyword.trim().toLowerCase();
  const bodyWords = words(input.body);
  const wordCount = bodyWords.length;
  const lowerBody = input.body.toLowerCase();
  const lowerTitle = input.title.toLowerCase();
  const firstPara = (input.body.split(/\n\s*\n/)[0] ?? "").toLowerCase();

  // keyword occurrences (whole-ish phrase match)
  const keywordCount = kw
    ? (lowerBody.match(new RegExp(escapeRegExp(kw), "g")) ?? []).length
    : 0;
  const density = wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0;
  const readability = fleschReadingEase(input.body);

  const checks: SeoCheck[] = [
    titleLengthCheck(input.title),
    metaLengthCheck(input.metaDescription),
    kw
      ? boolCheck("kw-title", "Keyword in title", lowerTitle.includes(kw),
          lowerTitle.includes(kw) ? "Focus keyword appears in the title." : "Add the focus keyword to the title.")
      : warnCheck("kw-title", "Keyword in title", "Set a focus keyword first."),
    kw
      ? boolCheck("kw-intro", "Keyword in first paragraph", firstPara.includes(kw),
          firstPara.includes(kw) ? "Keyword appears early." : "Mention the keyword in the opening paragraph.")
      : warnCheck("kw-intro", "Keyword in first paragraph", "Set a focus keyword first."),
    densityCheck(density, kw),
    wordCountCheck(wordCount),
    headingCheck(input.body),
    readabilityCheck(readability),
  ];

  const score = Math.round(
    (checks.reduce((a, c) => a + STATUS_WEIGHT[c.status], 0) / checks.length) * 100,
  );

  return {
    slug: slugify(input.title || input.focusKeyword),
    wordCount,
    keywordCount,
    density,
    readability,
    readabilityLabel: readabilityLabel(readability),
    score,
    checks,
  };
}

/* ----------------------------- check builders ----------------------------- */

function titleLengthCheck(title: string): SeoCheck {
  const n = title.trim().length;
  if (n === 0) return fail("title-len", "Title length", "Add a title tag.");
  if (n >= 50 && n <= 60) return pass("title-len", "Title length", `${n} chars - ideal (50-60).`);
  if (n >= 40 && n <= 65) return warn("title-len", "Title length", `${n} chars - acceptable, aim for 50-60.`);
  return fail("title-len", "Title length", `${n} chars - keep it 50-60 to avoid truncation.`);
}

function metaLengthCheck(meta: string): SeoCheck {
  const n = meta.trim().length;
  if (n === 0) return fail("meta-len", "Meta description", "Add a meta description.");
  if (n >= 120 && n <= 158) return pass("meta-len", "Meta description", `${n} chars - ideal (120-158).`);
  if (n >= 80 && n <= 165) return warn("meta-len", "Meta description", `${n} chars - acceptable, aim for 120-158.`);
  return fail("meta-len", "Meta description", `${n} chars - target 120-158.`);
}

function densityCheck(density: number, kw: string): SeoCheck {
  if (!kw) return warn("density", "Keyword density", "Set a focus keyword first.");
  if (density === 0) return fail("density", "Keyword density", "Keyword never appears in the body.");
  if (density >= 0.5 && density <= 2.5) return pass("density", "Keyword density", `${density}% - healthy (0.5-2.5%).`);
  if (density > 2.5) return warn("density", "Keyword density", `${density}% - risks keyword stuffing.`);
  return warn("density", "Keyword density", `${density}% - a little low, aim for 0.5-2.5%.`);
}

function wordCountCheck(n: number): SeoCheck {
  if (n >= 600) return pass("words", "Content length", `${n} words - solid depth.`);
  if (n >= 300) return warn("words", "Content length", `${n} words - okay, longer ranks better.`);
  return fail("words", "Content length", `${n} words - thin, aim for 600+.`);
}

function headingCheck(body: string): SeoCheck {
  const headings = (body.match(/^#{1,6}\s|^.+\n[-=]{3,}$/gm) ?? []).length;
  if (headings >= 2) return pass("headings", "Headings", `${headings} headings - good structure.`);
  if (headings === 1) return warn("headings", "Headings", "Only one heading - add subheadings.");
  return warn("headings", "Headings", "No markdown headings detected - break up the content.");
}

function readabilityCheck(score: number): SeoCheck {
  if (score >= 60) return pass("read", "Readability", `Flesch ${score} - easy to read.`);
  if (score >= 40) return warn("read", "Readability", `Flesch ${score} - moderately hard, shorten sentences.`);
  return fail("read", "Readability", `Flesch ${score} - hard to read, simplify.`);
}

const pass = (id: string, label: string, detail: string): SeoCheck => ({ id, label, status: "pass", detail });
const warn = (id: string, label: string, detail: string): SeoCheck => ({ id, label, status: "warn", detail });
const fail = (id: string, label: string, detail: string): SeoCheck => ({ id, label, status: "fail", detail });
const boolCheck = (id: string, label: string, ok: boolean, detail: string): SeoCheck =>
  ok ? pass(id, label, detail) : fail(id, label, detail);
const warnCheck = warn;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
