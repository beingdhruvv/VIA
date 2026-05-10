import { cn } from "@/lib/utils";
import type { TripStatus, ActivityCategory, ExpenseCategory } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "navy" | "red" | "grey" | "outline";
  className?: string;
}

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
const statusConfig: Record<TripStatus, { label: string; variant: BadgeProps["variant"] }> = {
  PLANNING: { label: "PLANNING", variant: "outline" },
  ACTIVE: { label: "ACTIVE", variant: "navy" },
  COMPLETED: { label: "COMPLETED", variant: "default" },
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const config = statusConfig[status] ?? { label: status, variant: "outline" };
  return (
    <Badge variant={config.variant} className="stamp-badge">
      {config.label}
    </Badge>
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
