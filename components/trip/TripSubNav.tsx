"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "ITINERARY", path: "" },
  { label: "MEMORIES",  path: "/memories" },
  { label: "BUILDER",   path: "/builder" },
  { label: "BUDGET",    path: "/budget" },
  { label: "PACKING",   path: "/packing" },
  { label: "NOTES",     path: "/notes" },
  { label: "MEMBERS",   path: "/members" },
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
        // Exact match for itinerary root; prefix match for sub-pages
        const isActive =
          tab.path === "" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={tab.label}
            href={href}
            className={[
              "px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
              isActive
                ? "border-via-black text-via-black font-medium"
                : "border-transparent text-via-grey-mid hover:text-via-black",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
