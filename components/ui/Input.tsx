/**
 * Input — labelled text input with error state, helper text,
 * and optional show/hide toggle for password fields.
 */
"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label rendered above the input */
  label?: string;
  /** Inline error message shown below in red — replaces helperText when set */
  error?: string;
  /** Subtle hint text below the input */
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, type, className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-via-black"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={[
              "w-full bg-via-off-white px-3 py-2 text-sm text-via-black",
              "border rounded-none outline-none",
              "placeholder:text-via-grey-mid",
              "transition-colors duration-100",
              "focus:border-2 focus:border-via-black",
              error
                ? "border-2 border-via-red"
                : "border border-via-grey-light",
              isPassword ? "pr-10" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-via-grey-mid hover:text-via-black transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error ? (
          <p className="text-xs text-via-red">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-via-grey-mid">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
