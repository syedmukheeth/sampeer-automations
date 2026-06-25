import { cn } from "@shared/lib/cn";

export type LogLine = {
  ts?: string;
  level?: "info" | "warn" | "error" | "debug";
  message: string;
};

const LEVEL: Record<NonNullable<LogLine["level"]>, string> = {
  info: "text-slate-300",
  warn: "text-amber-300",
  error: "text-rose-300",
  debug: "text-slate-500",
};

/** Terminal-style log panel for execution logs. */
export function LogViewer({
  lines,
  className,
  empty = "No logs yet.",
}: {
  lines: LogLine[];
  className?: string;
  empty?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-xl bg-sidebar p-4 font-mono text-xs leading-relaxed",
        className,
      )}
    >
      {lines.length === 0 ? (
        <span className="text-slate-500">{empty}</span>
      ) : (
        lines.map((l, i) => (
          <div key={i} className="flex gap-3">
            {l.ts && <span className="shrink-0 text-slate-600">{l.ts}</span>}
            <span className={cn("whitespace-pre-wrap", LEVEL[l.level ?? "info"])}>
              {l.message}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
