/**
 * Content angle generator + headline scorer - pure, deterministic TypeScript.
 * Instant (no LLM, no external data). Given a niche/keyword it fills proven
 * headline formulas and scores each on real virality signals (number, power
 * word, length, brackets, emotion). Unit-tested. (Live-trend upgrade can feed
 * real search/social data into the same ranking.)
 */

export interface AngleInput {
  niche: string;
  keyword: string;
  audience: string;
}

export interface Angle {
  format: string;
  headline: string;
  hook: string;
  score: number; // 0-100 virality heuristic
}

const POWER_WORDS = [
  "secret", "proven", "ultimate", "instantly", "free", "mistake", "truth",
  "fast", "easy", "stop", "never", "best", "new", "now", "guide", "hack",
];
const EMOTION_WORDS = ["love", "fear", "shocking", "surprising", "fail", "win", "regret", "happy"];

/** Score a headline on common click-through signals. Deterministic. */
export function scoreHeadline(headline: string): number {
  const h = headline.toLowerCase();
  let score = 40;

  if (/\d/.test(h)) score += 15; // contains a number
  if (POWER_WORDS.some((w) => h.includes(w))) score += 15;
  if (EMOTION_WORDS.some((w) => h.includes(w))) score += 8;
  if (/[([]/.test(headline)) score += 8; // bracket/parenthetical

  const len = headline.length;
  if (len >= 45 && len <= 65) score += 14;
  else if (len >= 35 && len <= 75) score += 7;
  else score -= 6;

  if (/\b(how|why|what)\b/.test(h)) score += 5; // curiosity / question

  return Math.max(0, Math.min(100, Math.round(score)));
}

function cap(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

export function generateAngles(input: AngleInput): Angle[] {
  const kw = cap(input.keyword.trim() || input.niche.trim() || "Your Topic");
  const niche = input.niche.trim() || "your space";
  const aud = input.audience.trim() || "beginners";

  const raw: Omit<Angle, "score">[] = [
    {
      format: "Listicle",
      headline: `7 ${kw} Tactics That Actually Work in 2026`,
      hook: `Open with the #1 tactic so they keep scrolling for the rest.`,
    },
    {
      format: "How-to",
      headline: `How to Master ${kw} in 10 Minutes a Day`,
      hook: `Promise the outcome, then show the exact daily routine.`,
    },
    {
      format: "Contrarian",
      headline: `Stop Doing ${kw} the Old Way - Here's the Truth`,
      hook: `Name the common advice, then explain why it quietly fails.`,
    },
    {
      format: "Case study",
      headline: `How One ${cap(aud)} 3x'd Results With ${kw}`,
      hook: `Lead with the before/after number, then unpack the steps.`,
    },
    {
      format: "Mistakes",
      headline: `5 ${kw} Mistakes Costing You Time (and How to Fix Them)`,
      hook: `Start with the most painful mistake your audience makes.`,
    },
    {
      format: "Beginner guide",
      headline: `The Complete ${kw} Guide for ${cap(aud)} (No Fluff)`,
      hook: `Reassure them it's beginner-proof, then map the full path.`,
    },
    {
      format: "Prediction",
      headline: `Why ${kw} Is About to Change ${cap(niche)} Forever`,
      hook: `Open with the shift that's coming and the stakes of ignoring it.`,
    },
    {
      format: "Comparison",
      headline: `${kw} vs the Old Playbook: Which Wins in 2026?`,
      hook: `Set up the head-to-head, then declare a clear winner with proof.`,
    },
  ];

  return raw
    .map((a) => ({ ...a, score: scoreHeadline(a.headline) }))
    .sort((a, b) => b.score - a.score);
}
