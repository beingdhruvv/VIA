/**
 * Sidebar — fixed 260px left nav for desktop (md+).
 * Hidden on mobile. Shows VIA logo, primary nav links, and a user footer.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Compass,
  User,
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SessionUser } from "@/types";

interface SidebarProps {
  user: SessionUser;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/cities", label: "Cities", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
];

function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-via-white border-r border-via-grey-light z-30">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 border-b border-via-grey-light">
        <span
          className="block font-bold text-2xl text-via-black leading-none tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
        >
          VIA
        </span>
        <span className="block text-xs text-via-grey-mid mt-1 tracking-wide">
          Travel Planner
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-via-off-white border-l-2 border-via-black text-via-black"
                      : "text-via-grey-mid hover:text-via-black hover:bg-via-off-white border-l-2 border-transparent",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Admin Link */}
          {isAdmin && (
            <li className="pt-4 mt-4 border-t border-via-grey-light">
              <Link
                href="/admin"
                className={[
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-via-red/5 border-l-2 border-via-red text-via-red"
                    : "text-via-grey-mid hover:text-via-red hover:bg-via-red/5 border-l-2 border-transparent",
                ].join(" ")}
              >
                <LayoutDashboard size={18} />
                Admin Control
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-4 pb-5 pt-4 border-t border-via-grey-light">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user.name ?? undefined} src={user.image} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-via-black truncate">
              {user.name ?? "User"}
            </p>
            <p className="text-xs text-via-grey-mid truncate">{user.email}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-via-grey-mid hover:text-via-black transition-colors w-full py-1"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export { Sidebar };
export type { SidebarProps };
