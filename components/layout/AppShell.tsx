/**
 * AppShell — root layout wrapper for all authenticated pages.
 * Desktop: Sidebar (260px fixed) + scrollable main content area.
 * Mobile: Navbar (top) + BottomNav (bottom) + full-width content.
 */
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { SessionUser } from "@/types";

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
  /** Passed to Navbar — shows back arrow instead of menu icon on mobile */
  showBack?: boolean;
}

function AppShell({ user, children, showBack = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-via-white">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar user={user} />

      {/* Mobile top bar */}
      <Navbar user={user} showBack={showBack} />

      {/* Main content */}
      <main
        className={[
          /* On desktop, offset by sidebar width */
          "md:ml-[260px]",
          /* On mobile, account for fixed top and bottom bars */
          "pt-14 pb-16 md:pt-0 md:pb-0",
          "min-h-screen",
        ].join(" ")}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}

export { AppShell };
export type { AppShellProps };
