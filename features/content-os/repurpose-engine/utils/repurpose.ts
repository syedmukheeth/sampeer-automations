/**
 * Content repurposer - pure, deterministic TypeScript. Instant (no LLM, no job).
 * Takes one long-form draft and reshapes it into a tweet/X thread, a LinkedIn
 * post, a newsletter blurb, and a bullet summary. All splitting/formatting is
 * rule-based so the output is stable and unit-tested.
 */

export type Format = "thread" | "linkedin" | "newsletter" | "summary";

export interface RepurposeOptions {
  handle?: string; // optional @handle / name for sign-off
  threadLimit?: number; // max chars per tweet (default 270)
}

export interface RepurposeOutput {
  thread: string[];
  linkedin: string;
  newsletter: string;
  summary: string[];
}

/** Split prose into trimmed sentences. Falls back to the whole block. */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const matched = cleaned.match(/[^.!?]+[.!?]+(?:["')\]]+)?|\S[^.!?]*$/g);
  return (matched ?? [cleaned]).map((s) => s.trim()).filter(Boolean);
}

function titleFrom(sentences: string[]): string {
  const first = sentences[0] ?? "Untitled";
  return first.replace(/[.!?]+$/, "").split(" ").slice(0, 8).join(" ");
}

/** Pack sentences into numbered tweets under the char limit. */
export function buildThread(text: string, limit = 270): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];
  const room = limit - 8; // leave space for " (12/34)"
  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    const piece = s.length > room ? s.slice(0, room - 1).trimEnd() + "…" : s;
    if (!current) {
      current = piece;
    } else if (current.length + 1 + piece.length <= room) {
      current += " " + piece;
    } else {
      chunks.push(current);
      current = piece;
    }
  }
  if (current) chunks.push(current);

  const n = chunks.length;
  return chunks.map((c, i) => `${c} (${i + 1}/${n})`);
}

export function buildLinkedin(text: string, opts: RepurposeOptions = {}): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";
  const hook = sentences[0];
  const body = sentences.slice(1, 6).join(" ");
  const who = opts.handle?.trim();
  const cta = who
    ? `Found this useful? Repost ♻️ and follow ${who} for more.`
    : "Found this useful? Repost ♻️ to share it.";
  return [hook, body, cta].filter(Boolean).join("\n\n");
}

export function buildNewsletter(text: string, opts: RepurposeOptions = {}): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";
  const title = titleFrom(sentences);
  const intro = sentences[0];
  const points = sentences.slice(1, 5).map((s) => `- ${s}`);
  const who = opts.handle?.trim();
  const signoff = who ? `Until next time,\n${who}` : "Until next time.";
  return [
    `## ${title}`,
    intro,
    points.length ? `**Key points:**\n${points.join("\n")}` : "",
    signoff,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildSummary(text: string): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];
  // First sentence + the next longest ones, capped at 4, in original order.
  const first = sentences[0];
  const rest = sentences.slice(1);
  const ranked = rest
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return [first, ...ranked].map((s) => s.replace(/\s+/g, " ").trim());
}

export function repurpose(text: string, opts: RepurposeOptions = {}): RepurposeOutput {
  return {
    thread: buildThread(text, opts.threadLimit ?? 270),
    linkedin: buildLinkedin(text, opts),
    newsletter: buildNewsletter(text, opts),
    summary: buildSummary(text),
  };
}
