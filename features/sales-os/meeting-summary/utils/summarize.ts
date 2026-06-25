/**
 * Meeting summarizer - pure, deterministic TypeScript. Instant (no LLM, no job).
 * Extractive: pulls a short summary, action items, decisions, questions, and
 * speakers from raw notes/transcript using keyword + structural heuristics.
 * Unit-tested. (LLM upgrade can swap summarize() for an abstractive model.)
 */

export interface MeetingSummary {
  summary: string[];
  actionItems: ActionItem[];
  decisions: string[];
  questions: string[];
  speakers: string[];
  wordCount: number;
}

export interface ActionItem {
  owner: string; // "" when unknown
  text: string;
}

const ACTION_RE = /\b(will|i'?ll|we'?ll|need to|needs to|should|let'?s|action item|follow[- ]?up|to-?do|assign|send|schedule|draft|prepare|review|circle back|own[s]?)\b/i;
const DECISION_RE = /\b(decided|agreed|approved|going with|we'?ll go|final(?:ized)?|consensus|settled on|chose|signed off)\b/i;

/** Split into trimmed lines (keep speaker tags) then into sentences. */
function lines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function sentencesOf(line: string): string[] {
  const body = line.replace(/^[A-Z][\w .'-]{0,30}:\s*/, ""); // strip "Name:"
  const matched = body.match(/[^.!?]+[.!?]+(?:["')\]]+)?|\S[^.!?]*$/g);
  return (matched ?? [body]).map((s) => s.trim()).filter(Boolean);
}

function speakerOf(line: string): string {
  const m = line.match(/^([A-Z][\w .'-]{0,30}):\s*/);
  return m ? m[1].trim() : "";
}

/** Owner from "Name will ..." or a leading speaker tag. */
function ownerOf(line: string, sentence: string): string {
  const tag = speakerOf(line);
  if (tag) return tag;
  const m = sentence.match(/\b([A-Z][a-z]+)\s+(?:will|to|should|needs to|is going to)\b/);
  return m ? m[1] : "";
}

const words = (s: string) => (s.trim().match(/[A-Za-z0-9']+/g) ?? []);

export function summarize(text: string): MeetingSummary {
  const ls = lines(text);
  const wordCount = words(text).length;

  const speakers = Array.from(new Set(ls.map(speakerOf).filter(Boolean)));
  const actionItems: ActionItem[] = [];
  const decisions: string[] = [];
  const questions: string[] = [];
  const allSentences: { text: string; len: number }[] = [];

  for (const line of ls) {
    for (const s of sentencesOf(line)) {
      allSentences.push({ text: s, len: words(s).length });
      if (s.endsWith("?")) questions.push(s);
      if (DECISION_RE.test(s)) decisions.push(s);
      else if (ACTION_RE.test(s)) actionItems.push({ owner: ownerOf(line, s), text: s });
    }
  }

  // Summary = first sentence + the longest remaining ones, in original order.
  const summary = pickSummary(allSentences.map((s) => s.text), 4);

  return {
    summary,
    actionItems: dedupe(actionItems, (a) => a.text).slice(0, 12),
    decisions: dedupe(decisions, (d) => d).slice(0, 8),
    questions: dedupe(questions, (q) => q).slice(0, 8),
    speakers,
    wordCount,
  };
}

function pickSummary(sentences: string[], max: number): string[] {
  if (sentences.length <= max) return sentences;
  const first = sentences[0];
  const rest = sentences.slice(1);
  const ranked = rest
    .map((s, i) => ({ s, i, len: words(s).length }))
    .sort((a, b) => b.len - a.len)
    .slice(0, max - 1)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return [first, ...ranked];
}

function dedupe<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item).toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}
