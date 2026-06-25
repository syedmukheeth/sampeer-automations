import { cn } from "@shared/lib/cn";

export type ActivityItem = {
  id: string;
  title: string;
  meta?: string;
  time: string;
  tone?: "success" | "running" | "failed" | "neutral";
};

const DOT: Record<NonNullable<ActivityItem["tone"]>, string> = {
  success: "bg-emerald-500",
  running: "bg-indigo-500 animate-pulse",
  failed: "bg-rose-500",
  neutral: "bg-slate-300",
};

/** Vertical activity / execution timeline. */
export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative space-y-5 pl-1">
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", DOT[it.tone ?? "neutral"])} />
            {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
          </div>
          <div className="-mt-0.5 flex-1 pb-1">
            <p className="text-sm font-medium text-ink">{it.title}</p>
            {it.meta && <p className="text-xs text-muted">{it.meta}</p>}
          </div>
          <span className="whitespace-nowrap text-xs text-muted">{it.time}</span>
        </li>
      ))}
    </ol>
  );
}
