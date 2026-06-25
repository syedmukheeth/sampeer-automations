/**
 * Video script builder - pure, deterministic TypeScript. Instant (no LLM, no
 * job). Turns a topic into a structured script (hook, sections with beats,
 * outro), title options, thumbnail text, and a shot list. Template-driven so the
 * output is stable and unit-tested. (LLM upgrade can swap buildScript later.)
 */

export type VideoTone = "educational" | "entertaining" | "promotional";
export type Platform = "youtube" | "shorts" | "tiktok" | "reel";

export interface ScriptInput {
  topic: string;
  audience: string;
  durationMin: number;
  tone: VideoTone;
  platform: Platform;
}

export interface ScriptSection {
  heading: string;
  beats: string[];
}

export interface VideoScript {
  titles: string[];
  hook: string;
  sections: ScriptSection[];
  outro: string;
  thumbnailText: string[];
  shotList: string[];
  wordTarget: number;
  estSeconds: number;
}

const WPM = 150; // spoken words per minute

const HOOKS: Record<VideoTone, (t: string, a: string) => string> = {
  educational: (t, a) => `If you've ever struggled with ${t.toLowerCase()}, this video breaks it down for ${a} in plain steps - no fluff.`,
  entertaining: (t) => `I tried ${t.toLowerCase()} so you don't have to - and it got weird fast. Stick around for the part nobody warns you about.`,
  promotional: (t, a) => `Here's how ${a} are getting results with ${t.toLowerCase()} in a fraction of the time - and how you can too.`,
};

const OUTROS: Record<VideoTone, string> = {
  educational: "Recap the three takeaways, then point viewers to the next video to keep the session going.",
  entertaining: "End on the funniest moment, tease the next episode, and ask viewers to comment their take.",
  promotional: "Restate the core benefit, drop the call to action, and add urgency (limited spots / this week only).",
};

function titleOptions(topic: string, tone: VideoTone): string[] {
  const t = topic.trim() || "This Topic";
  const base = [
    `${t}: The Complete Guide (2026)`,
    `How to Master ${t} in 10 Minutes`,
    `${t} - 5 Mistakes Everyone Makes`,
    `The Truth About ${t} Nobody Tells You`,
  ];
  if (tone === "promotional") base.unshift(`Why ${t} Is a Game-Changer (Real Results)`);
  if (tone === "entertaining") base.unshift(`I Tested ${t} for 30 Days - Here's What Happened`);
  return base.slice(0, 5);
}

function thumbnailText(topic: string): string[] {
  const t = (topic.trim().split(/\s+/).slice(0, 3).join(" ") || "TOPIC").toUpperCase();
  return [t, `${t}?!`, `${t} (FAST)`, "WATCH FIRST"];
}

/** Section count scales with duration; short-form gets a tighter structure. */
function sectionPlan(input: ScriptInput): ScriptSection[] {
  const t = input.topic.trim() || "the topic";
  const short = input.platform === "shorts" || input.platform === "tiktok" || input.platform === "reel";

  if (short) {
    return [
      { heading: "Pattern interrupt (0-3s)", beats: [`Open mid-action on ${t}.`, "State the payoff in one line."] },
      { heading: "Payoff (3-25s)", beats: [`Deliver the single best tip about ${t}.`, "Show, don't tell - use a quick visual."] },
      { heading: "Loop / CTA (25-40s)", beats: ["Tie the end back to the hook.", "Tell them to follow for part two."] },
    ];
  }

  const blocks = Math.max(3, Math.min(6, Math.round(input.durationMin / 1.5)));
  const sections: ScriptSection[] = [
    { heading: "Setup", beats: [`Frame the problem with ${t}.`, "Promise the outcome and set expectations."] },
  ];
  for (let i = 1; i <= blocks - 2; i++) {
    sections.push({
      heading: `Point ${i}`,
      beats: [`Teach key idea ${i} about ${t}.`, "Back it with an example or demo.", "Add one quick tip or pitfall."],
    });
  }
  sections.push({ heading: "Payoff", beats: ["Tie the points together.", "Show the end result or transformation."] });
  return sections;
}

export function buildScript(input: ScriptInput): VideoScript {
  const audience = input.audience.trim() || "your audience";
  const sections = sectionPlan(input);
  const estSeconds = Math.round(input.durationMin * 60);
  const wordTarget = Math.round((estSeconds / 60) * WPM);

  const shotList = [
    "Talking-head intro (eye-level, soft key light)",
    "B-roll over the hook to hold attention",
    ...sections.slice(1, -1).map((s) => `Screen capture / demo for "${s.heading}"`),
    "Lower-third graphics for each key point",
    "Outro card with subscribe + next-video thumbnail",
  ];

  return {
    titles: titleOptions(input.topic, input.tone),
    hook: HOOKS[input.tone](input.topic || "this", audience),
    sections,
    outro: OUTROS[input.tone],
    thumbnailText: thumbnailText(input.topic),
    shotList,
    wordTarget,
    estSeconds,
  };
}
