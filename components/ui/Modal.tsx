/**
 * Modal — dialog built on @radix-ui/react-dialog.
 * Exports Modal (Root), ModalTrigger, ModalContent, ModalHeader, ModalFooter.
 * Uses brutalist card style with hard box-shadow.
 */
"use client";

import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/* Re-export primitives under cleaner names */
const Modal = Dialog.Root;
const ModalTrigger = Dialog.Trigger;

interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

function ModalContent({ children, className = "" }: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={[
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] max-w-md",
          "bg-via-white border border-via-black rounded-none",
          "focus:outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ boxShadow: "3px 3px 0px #111111" }}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

interface ModalHeaderProps {
  /** Dialog title — required for accessibility */
  title: string;
  children?: ReactNode;
  className?: string;
}

function ModalHeader({ title, children, className = "" }: ModalHeaderProps) {
  return (
    <div
      className={[
        "flex items-center justify-between px-5 py-4 border-b border-via-grey-light",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Dialog.Title className="font-semibold text-base text-via-black leading-none">
        {title}
      </Dialog.Title>
      {children}
      <Dialog.Close
        className="text-via-grey-mid hover:text-via-black transition-colors ml-auto"
        aria-label="Close"
      >
        <X size={20} />
      </Dialog.Close>
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={[
        "flex items-center justify-end gap-2 px-5 py-4 border-t border-via-grey-light",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

const ModalClose = Dialog.Close;

export { Modal, ModalTrigger, ModalContent, ModalHeader, ModalFooter, ModalClose };
