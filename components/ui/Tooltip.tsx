/**
 * Tooltip — minimal black tooltip built on @radix-ui/react-tooltip.
 * 0 border-radius, via-black background, xs white text.
 */
"use client";

import { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Tooltip label text */
  content: string;
  /** Which side of the trigger to show the tooltip */
  side?: "top" | "bottom" | "left" | "right";
}

function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      {children}
    </RadixTooltip.Provider>
  );
}

function Tooltip({ children, content, side = "top" }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="bg-via-black text-via-white text-xs px-2 py-1 rounded-none z-50 select-none"
          style={{ maxWidth: 220 }}
        >
          {content}
          <RadixTooltip.Arrow className="fill-via-black" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export { Tooltip, TooltipProvider };
export type { TooltipProps };
