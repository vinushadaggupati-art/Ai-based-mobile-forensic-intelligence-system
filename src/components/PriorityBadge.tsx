import type { Priority } from "@/lib/forensic-data";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    high: "bg-priority-high/15 text-priority-high border-priority-high/40",
    medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/40",
    low: "bg-priority-low/15 text-priority-low border-priority-low/40",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider",
        map[priority],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
