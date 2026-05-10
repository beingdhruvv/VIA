/**
 * Tabs — underline-style tab navigation built on @radix-ui/react-tabs.
 * Active tab has a 2px bottom border in via-black. No pills, no rounded corners.
 */
"use client";

import { ReactNode } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

const Tabs = RadixTabs.Root;

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <RadixTabs.List
      className={[
        "flex border-b border-via-grey-light gap-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </RadixTabs.List>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function TabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={[
        "px-4 py-2.5 text-sm font-medium text-via-grey-mid",
        "border-b-2 border-transparent -mb-px",
        "hover:text-via-black transition-colors duration-100",
        "data-[state=active]:text-via-black data-[state=active]:border-via-black",
        "rounded-none outline-none focus-visible:ring-2 focus-visible:ring-via-black",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function TabsContent({ value, children, className = "" }: TabsContentProps) {
  return (
    <RadixTabs.Content
      value={value}
      className={["pt-4 outline-none", className].filter(Boolean).join(" ")}
    >
      {children}
    </RadixTabs.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
