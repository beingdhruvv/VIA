/**
 * Navbar — fixed top bar for mobile (hidden on md+).
 * Shows back/menu button on the left, VIA logo in the center,
 * and a user avatar or action slot on the right.
 */
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SessionUser } from "@/types";

interface NavbarProps {
  user?: SessionUser;
  /** When true shows a back arrow instead of the menu icon */
  showBack?: boolean;
  /** Replaces default right-slot with a custom node (e.g. an action button) */
  rightSlot?: ReactNode;
}

function Navbar({ user, showBack = false, rightSlot }: NavbarProps) {
  const router = useRouter();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-via-white border-b border-via-grey-light flex items-center px-4">
      {/* Left: back or menu */}
      <div className="w-10 flex items-center">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-via-black hover:text-via-grey-dark transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <button
            type="button"
            className="text-via-black hover:text-via-grey-dark transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      {/* Center: logo */}
      <div className="flex-1 flex justify-center">
        <Link
          href="/dashboard"
          className="font-bold text-xl text-via-black leading-none tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
        >
          VIA
        </Link>
      </div>

      {/* Right: custom slot or user avatar */}
      <div className="w-10 flex items-center justify-end">
        {rightSlot ?? (
          user ? (
            <Link href="/profile" aria-label="Profile">
              <Avatar name={user.name ?? undefined} src={user.image} size="sm" />
            </Link>
          ) : null
        )}
      </div>
    </header>
  );
}

export { Navbar };
export type { NavbarProps };
