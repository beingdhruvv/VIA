"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Map, Wallet, Images, PackageCheck, NotebookText, Users } from "lucide-react";

const TABS = [
  { label: "ITINERARY", path: "", icon: CalendarDays },
  { label: "BUILDER",   path: "/builder", icon: Map },
  { label: "BUDGET",    path: "/budget", icon: Wallet },
  { label: "MEMORIES",  path: "/memories", icon: Images },
  { label: "PACKING",   path: "/packing", icon: PackageCheck },
  { label: "NOTES",     path: "/notes", icon: NotebookText },
  { label: "MEMBERS",   path: "/members", icon: Users },
];

interface TripSubNavProps {
  tripId: string;
}

export function TripSubNav({ tripId }: TripSubNavProps) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  return (
    <div className="flex gap-0 overflow-x-auto border-t border-via-grey-light">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}`;
        const Icon = tab.icon;
        // Exact match for itinerary root; prefix match for sub-pages
        const isActive =
          tab.path === "" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
              isActive
                ? "border-via-black text-via-black font-medium"
                : "border-transparent text-via-grey-mid hover:text-via-black",
            ].join(" ")}
          >
            <Icon size={14} strokeWidth={1.7} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
