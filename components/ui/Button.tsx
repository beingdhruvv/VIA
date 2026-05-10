/**
 * Button — brutalist-style button with four variants, three sizes,
 * loading state with spinner, and forwarded ref.
 */
"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables the button while true */
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-via-black text-via-white border border-via-black",
  secondary: "bg-via-white text-via-black border border-via-black",
  destructive: "bg-via-red text-via-white border border-via-red",
  ghost: "bg-transparent text-via-black",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium cursor-pointer",
          "transition-shadow duration-100",
          "disabled:opacity-70 disabled:cursor-not-allowed",
          "rounded-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "2px 2px 0px #111111";
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
