"use client";

import { useState } from "react";
import { Link2, Check, Copy, MessageCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  shareUrl: string;
  tripId: string;
  tripName: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  views: number;
}

export function PublicShareActions({ shareUrl, tripId, tripName, isLoggedIn, isOwner, views }: Props) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const router = useRouter();

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out my trip "${tripName}" planned on VIA: ${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Planning "${tripName}" with VIA — check out my itinerary:`)}&url=${encodeURIComponent(shareUrl)}`;

  async function copyTrip() {
    if (!isLoggedIn) {
      router.push(`/auth/login?next=/trip/${shareUrl.split("/trip/")[1]}`);
      return;
    }
    setCopying(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/copy`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/trips/${data.id}/builder`);
      }
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Copy link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide border border-via-black px-3 py-1.5 hover:bg-via-black hover:text-via-white transition-colors"
      >
        {copied ? <><Check size={12} /> Copied</> : <><Link2 size={12} /> Copy Link</>}
      </button>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide border border-via-grey-light px-3 py-1.5 hover:border-via-black text-via-grey-mid hover:text-via-black transition-colors"
      >
        <MessageCircle size={12} /> WhatsApp
      </a>

      {/* Twitter/X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide border border-via-grey-light px-3 py-1.5 hover:border-via-black text-via-grey-mid hover:text-via-black transition-colors"
      >
        X / Twitter
      </a>

      {/* Copy trip — only for logged-in non-owners */}
      {isLoggedIn && !isOwner && (
        <button
          onClick={copyTrip}
          disabled={copying}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide border border-via-navy bg-via-navy text-via-white px-3 py-1.5 hover:bg-via-black hover:border-via-black transition-colors disabled:opacity-60"
        >
          <Copy size={12} /> {copying ? "Copying..." : "Copy Trip"}
        </button>
      )}

      {/* Login to copy — for guests */}
      {!isLoggedIn && (
        <button
          onClick={copyTrip}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide border border-via-grey-light text-via-grey-mid px-3 py-1.5 hover:border-via-black hover:text-via-black transition-colors"
        >
          <Copy size={12} /> Copy Trip
        </button>
      )}

      {/* View count (owner only) */}
      {isOwner && (
        <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-via-grey-mid">
          <Eye size={12} /> {views} view{views !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
