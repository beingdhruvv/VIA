/**
 * Skeleton — animated loading placeholder.
 * Variants cover common shapes; arbitrary shapes via className.
 */
import { HTMLAttributes } from "react";

type SkeletonVariant = "text" | "card" | "avatar" | "custom";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-none",
  card: "h-48 w-full rounded-none",
  avatar: "h-10 w-10 rounded-full",
  custom: "",
};

function Skeleton({ variant = "text", className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "bg-via-grey-light animate-pulse",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps, SkeletonVariant };
