import { cn } from "@/lib/utils";
import type { TripStatus, ActivityCategory, ExpenseCategory } from "@/types";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "navy" | "red" | "grey" | "outline";
  className?: string;
}

export type BadgeVariant = BadgeProps["variant"];

/** Base badge — monospace uppercase label */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-via-black text-via-white",
    navy: "bg-via-navy text-via-white",
    red: "bg-via-red text-via-white",
    grey: "bg-via-grey-light text-via-grey-dark",
    outline: "bg-transparent border border-via-black text-via-black",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[11px] font-500 tracking-[0.05em] uppercase px-2 py-0.5",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Trip status rubber-stamp badge */
const stampConfig: Record<TripStatus, { label: string; color: string }> = {
  PLANNING: { label: "PLANNING", color: "border-via-black text-via-black bg-via-white" },
  ACTIVE:   { label: "ACTIVE",   color: "border-via-navy text-via-navy bg-via-white" },
  COMPLETED:{ label: "COMPLETED",color: "border-via-grey-dark text-via-grey-dark bg-via-white" },
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const cfg = stampConfig[status] ?? stampConfig.PLANNING;
  return (
    <span
      className={[
        "inline-flex items-center font-mono text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-0.5",
        "border-2",
        cfg.color,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}

/** Activity category colour-coded badge */
const activityColors: Record<ActivityCategory, string> = {
  SIGHTSEEING: "bg-via-navy text-via-white",
  FOOD: "bg-via-red text-via-white",
  ADVENTURE: "bg-via-black text-via-white",
  CULTURE: "bg-via-grey-dark text-via-white",
  SHOPPING: "bg-via-grey-light text-via-black",
  WELLNESS: "bg-via-off-white text-via-black border border-via-grey-light",
};

export function ActivityBadge({ category }: { category: ActivityCategory }) {
  return (
    <span className={cn("inline-flex items-center font-mono text-[11px] tracking-[0.04em] uppercase px-2 py-0.5", activityColors[category] ?? "bg-via-grey-light text-via-black")}>
      {category}
    </span>
  );
}

/** Expense category badge */
const expenseColors: Record<ExpenseCategory, string> = {
  TRANSPORT: "bg-via-navy text-via-white",
  STAY: "bg-via-black text-via-white",
  FOOD: "bg-via-red text-via-white",
  ACTIVITIES: "bg-via-grey-dark text-via-white",
  MISC: "bg-via-grey-light text-via-black",
};

export function ExpenseBadge({ category }: { category: ExpenseCategory }) {
  return (
    <span className={cn("inline-flex items-center font-mono text-[11px] tracking-[0.04em] uppercase px-2 py-0.5", expenseColors[category] ?? "bg-via-grey-light text-via-black")}>
      {category}
    </span>
  );
}
