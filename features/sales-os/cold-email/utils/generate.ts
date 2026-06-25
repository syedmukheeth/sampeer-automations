/**
 * Cold-email sequence generator - pure, deterministic TypeScript.
 *
 * Instant (no background job, no LLM). Given a few inputs it assembles a
 * 4-touch outbound sequence from copy frameworks (AIDA / PAS / BAB) and a tone.
 * Every word is template-driven so the output is explainable and testable -
 * same discipline as the rest of the platform (logic in TS, no hallucination).
 */

export type Framework = "aida" | "pas" | "bab";
export type Tone = "direct" | "friendly" | "formal";

export interface ColdEmailInput {
  senderName: string;
  senderCompany: string;
  offer: string; // the outcome you deliver
  prospectName: string;
  prospectCompany: string;
  painPoint: string; // the problem they likely face
  proof: string; // a result / social proof point
  cta: string; // the ask (e.g. "a quick 15-min call")
  framework: Framework;
  tone: Tone;
}

export interface EmailMessage {
  step: number;
  day: number; // send on day N of the sequence
  label: string; // purpose of the touch
  subject: string;
  body: string;
  words: number;
}

export const FRAMEWORKS: { id: Framework; name: string; blurb: string }[] = [
  { id: "aida", name: "AIDA", blurb: "Attention · Interest · Desire · Action" },
  { id: "pas", name: "PAS", blurb: "Problem · Agitate · Solution" },
  { id: "bab", name: "BAB", blurb: "Before · After · Bridge" },
];

export const TONES: { id: Tone; name: string }[] = [
  { id: "direct", name: "Direct" },
  { id: "friendly", name: "Friendly" },
  { id: "formal", name: "Formal" },
];

const firstName = (full: string) => (full.trim().split(/\s+/)[0] || "there");

function greeting(tone: Tone, prospect: string): string {
  const first = firstName(prospect);
  if (tone === "formal") return `Dear ${prospect.trim() || first},`;
  if (tone === "direct") return `${first} —`;
  return `Hi ${first},`;
}

function signoff(tone: Tone, sender: string, company: string): string {
  const who = [sender.trim(), company.trim()].filter(Boolean).join("\n");
  if (tone === "formal") return `Best regards,\n${who}`;
  if (tone === "direct") return `— ${[sender.trim(), company.trim()].filter(Boolean).join(", ")}`;
  return `Cheers,\n${who}`;
}

function lower(s: string): string {
  const t = s.trim();
  return t ? t[0].toLowerCase() + t.slice(1) : t;
}

function countWords(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

/** First-touch body, structured by the chosen framework. */
function openingBody(i: ColdEmailInput): string {
  const pain = lower(i.painPoint || "the manual work piling up");
  const offer = lower(i.offer || "a faster way to handle it");
  const proof = i.proof.trim();
  const proofLine = proof ? `${proof}\n\n` : "";
  const cta = i.cta.trim() || "a quick 15-minute call this week";
  const them = i.prospectCompany.trim() || "your team";

  if (i.framework === "pas") {
    return [
      `Most teams like ${them} quietly lose hours to ${pain}.`,
      `Left alone it compounds - slower follow-ups, dropped revenue, and work that never scales past the people doing it.`,
      `We give you ${offer}, so that stops being your problem.`,
      proofLine.trim(),
      `Worth ${cta}?`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (i.framework === "bab") {
    return [
      `Right now, ${them} is probably dealing with ${pain}.`,
      `Imagine that handled automatically - the same output without the manual grind.`,
      `That's exactly what we build: ${offer}.`,
      proofLine.trim(),
      `Open to ${cta}?`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  // AIDA (default)
  return [
    `Noticed ${them} is likely wrestling with ${pain}.`,
    `We help teams turn that into ${offer} - usually live in days, not months.`,
    proof ? proof : `Clients see the difference in the first week.`,
    `Worth ${cta}?`,
  ].join("\n\n");
}

/** Build the full 4-touch sequence. Deterministic. */
export function buildSequence(input: ColdEmailInput): EmailMessage[] {
  const them = input.prospectCompany.trim() || "your team";
  const first = firstName(input.prospectName);
  const g = greeting(input.tone, input.prospectName);
  const sign = signoff(input.tone, input.senderName, input.senderCompany);
  const cta = input.cta.trim() || "a quick 15-minute call";
  const offerShort = lower(input.offer || "a faster workflow");

  const compose = (lines: string[]) => `${g}\n\n${lines.join("\n\n")}\n\n${sign}`;

  const touches: Omit<EmailMessage, "words">[] = [
    {
      step: 1,
      day: 0,
      label: "First touch",
      subject: `${them}: ${offerShort}`,
      body: compose([openingBody(input)]),
    },
    {
      step: 2,
      day: 3,
      label: "Bump",
      subject: `Re: ${them}: ${offerShort}`,
      body: compose([
        `Floating this back to the top of your inbox, ${first}.`,
        `Even if the timing's off, I'd value knowing whether ${lower(input.painPoint || "this")} is on your radar this quarter.`,
        `Worth ${cta}?`,
      ]),
    },
    {
      step: 3,
      day: 6,
      label: "Value add",
      subject: `One idea for ${them}`,
      body: compose([
        input.proof.trim()
          ? input.proof.trim()
          : `Teams we work with usually claw back several hours a week after switching this on.`,
        `Happy to walk you through how it'd map to ${them} specifically - no pitch, just the playbook.`,
        `${cta.charAt(0).toUpperCase() + cta.slice(1)}?`,
      ]),
    },
    {
      step: 4,
      day: 10,
      label: "Breakup",
      subject: `Should I close the loop?`,
      body: compose([
        `I don't want to crowd your inbox, ${first}.`,
        `If ${lower(input.painPoint || "this")} isn't a priority right now, just say the word and I'll step back.`,
        `If it is, ${lower(cta)} and I'll take it from there.`,
      ]),
    },
  ];

  return touches.map((t) => ({ ...t, words: countWords(t.body) }));
}
