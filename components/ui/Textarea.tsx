/**
 * Textarea — labelled multiline input with error state, helper text,
 * and optional live character counter shown in monospace.
 */
"use client";

import { forwardRef, TextareaHTMLAttributes, useState, ChangeEvent } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      className = "",
      id,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      () =>
        (typeof value === "string"
          ? value.length
          : typeof defaultValue === "string"
          ? defaultValue.length
          : 0)
    );

    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
      setCharCount(e.target.value.length);
      onChange?.(e);
    }

    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-baseline justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-via-black"
            >
              {label}
            </label>
          )}
          {maxLength != null && (
            <span
              className="text-[11px] text-via-grey-mid"
              style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
            >
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={[
            "w-full bg-via-off-white px-3 py-2 text-sm text-via-black",
            "border rounded-none outline-none resize-y min-h-[96px]",
            "placeholder:text-via-grey-mid",
            "transition-colors duration-100",
            "focus:border-2 focus:border-via-black",
            error
              ? "border-2 border-via-red"
              : "border border-via-grey-light",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {error ? (
          <p className="text-xs text-via-red">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-via-grey-mid">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
