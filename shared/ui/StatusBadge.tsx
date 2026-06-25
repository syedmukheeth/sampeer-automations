import { cn } from "@shared/lib/cn";

type Tone = "live" | "soon" | "success" | "running" | "failed" | "neutral";

const TONES: Record<Tone, string> = {
  live: "bg-brand-50 text-brand-700 ring-brand-500/20",
  success: "bg-brand-50 text-brand-700 ring-brand-500/20",
  soon: "bg-stone-100 text-stone-600 ring-stone-400/30",
  running: "bg-warn/10 text-warn ring-warn/25",
  failed: "bg-danger/10 text-danger ring-danger/25",
  neutral: "bg-stone-100 text-stone-600 ring-stone-400/30",
};

const LABELS: Partial<Record<Tone, string>> = {
  live: "Live",
  soon: "Soon",
};

export function StatusBadge({
  tone = "neutral",
  children,
  dot,
  className,
}: {
  tone?: Tone;
  children?: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "running" && "animate-pulse bg-warn",
            (tone === "live" || tone === "success") && "bg-brand-600",
            tone === "failed" && "bg-danger",
            (tone === "soon" || tone === "neutral") && "bg-stone-400",
          )}
        />
      )}
      {children ?? LABELS[tone] ?? tone}
    </span>
  );
}
