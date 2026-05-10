/**
 * BottomNav — fixed bottom navigation bar for mobile (hidden on md+).
 * Four items: Dashboard, Trips, Cities, Profile.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Compass, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/cities", label: "Cities", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-via-white border-t border-via-black h-16 flex items-stretch">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors border-r last:border-r-0 border-via-grey-light",
              isActive
                ? "text-via-black bg-via-off-white border-t-2 border-t-via-black"
                : "text-via-grey-mid hover:text-via-black",
            ].join(" ")}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span className="font-mono text-[9px] uppercase tracking-wider">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export { BottomNav };
