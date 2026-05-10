/**
 * Sheet — slide-in panel from the right, built on @radix-ui/react-dialog.
 * Full-height, max-w-md, with a close button in the top-right corner.
 */
"use client";

import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;

interface SheetContentProps {
  children: ReactNode;
  /** Optional title for the sheet header */
  title?: string;
  className?: string;
}

function SheetContent({ children, title, className = "" }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={[
          "fixed right-0 top-0 bottom-0 z-50",
          "w-full max-w-md h-full",
          "bg-via-white border-l border-via-black rounded-none",
          "flex flex-col",
          "focus:outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "duration-200",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-via-grey-light shrink-0">
          {title ? (
            <Dialog.Title className="font-semibold text-base text-via-black leading-none">
              {title}
            </Dialog.Title>
          ) : (
            /* Hidden title keeps dialog accessible even without a visible heading */
            <Dialog.Title className="sr-only">Panel</Dialog.Title>
          )}
          <Dialog.Close
            className="text-via-grey-mid hover:text-via-black transition-colors ml-auto"
            aria-label="Close panel"
          >
            <X size={20} />
          </Dialog.Close>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export { Sheet, SheetTrigger, SheetContent };
