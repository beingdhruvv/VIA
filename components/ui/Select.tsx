"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-inter text-[13px] font-500 text-via-black">{label}</label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex items-center justify-between w-full h-10 px-3",
            "font-inter text-[14px] text-via-black",
            "bg-via-off-white border border-via-grey-light",
            "focus:outline-none focus:border-via-black focus:border-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-via-red",
            className
          )}
        >
          <SelectPrimitive.Value placeholder={<span className="text-via-grey-mid">{placeholder}</span>} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} className="text-via-grey-mid" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 bg-via-white border border-via-black shadow-brutalist overflow-hidden"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5",
                    "font-inter text-[14px] cursor-pointer",
                    "hover:bg-via-off-white focus:bg-via-off-white",
                    "focus:outline-none"
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={14} className="text-via-black" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="font-inter text-[12px] text-via-red">{error}</p>}
    </div>
  );
}
