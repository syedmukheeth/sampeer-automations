import { cn } from "@shared/lib/cn";

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </h2>
      {action}
    </div>
  );
}
