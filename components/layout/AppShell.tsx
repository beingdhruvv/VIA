"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { SearchOverlay } from "@/components/dashboard/SearchOverlay";
import { SessionUser } from "@/types";

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
  /** Passed to Navbar — shows back arrow instead of menu icon on mobile */
  showBack?: boolean;
}

function AppShell({ user, children, showBack = false }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-via-white overflow-x-clip">
      {/* Search overlay shortcut */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar user={user} onSearchClick={() => setSearchOpen(true)} />

      {/* Mobile top bar */}
      <Navbar user={user} showBack={showBack} />

      {/* Main content */}
      <main
        className={[
          /* On desktop, offset by sidebar width */
          "md:ml-[260px]",
          /* On mobile, account for fixed top and bottom bars */
          "pt-14 pb-16 md:pt-0 md:pb-0",
          "min-h-screen min-w-0",
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

