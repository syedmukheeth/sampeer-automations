import { cn } from "@shared/lib/cn";

type Tone = "live" | "soon" | "success" | "running" | "failed" | "neutral";

const TONES: Record<Tone, string> = {
  live: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  soon: "bg-amber-50 text-amber-700 ring-amber-600/20",
  running: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "running" && "animate-pulse bg-indigo-500",
            (tone === "live" || tone === "success") && "bg-emerald-500",
            tone === "failed" && "bg-rose-500",
            tone === "soon" && "bg-amber-500",
            tone === "neutral" && "bg-slate-400",
          )}
        />
      )}
      {children ?? LABELS[tone] ?? tone}
    </span>
  );
}
