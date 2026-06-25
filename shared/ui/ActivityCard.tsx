import { cn } from "@shared/lib/cn";

export type ActivityItem = {
  id: string;
  title: string;
  meta?: string;
  time: string;
  tone?: "success" | "running" | "failed" | "neutral";
};

const DOT: Record<NonNullable<ActivityItem["tone"]>, string> = {
  success: "bg-brand-600",
  running: "bg-amber-600 animate-pulse",
  failed: "bg-rose-500",
  neutral: "bg-stone-300",
};

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative space-y-5">
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <span className={cn("mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-stone-100", DOT[it.tone ?? "neutral"])} />
            {i < items.length - 1 && <span className="mt-2 w-px flex-1 bg-line" />}
          </div>
          <div className="-mt-0.5 min-w-0 flex-1 pb-1">
            <p className="truncate text-sm font-semibold text-ink">{it.title}</p>
            {it.meta && <p className="truncate text-xs leading-5 text-muted">{it.meta}</p>}
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-muted">{it.time}</span>
        </li>
      ))}
    </ol>
  );
}
