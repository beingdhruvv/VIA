/**
 * VIA landing page — full premium hero for unauthenticated visitors.
 * Pure typography and geometry; no images or illustrations.
 */

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-via-white flex flex-col">
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-16 pb-12">
        {/* Top rule */}
        <div className="w-16 h-0.5 bg-via-black mb-10" />

        {/* Wordmark */}
        <h1
          className="text-[clamp(6rem,20vw,14rem)] font-bold leading-none tracking-tighter text-via-black select-none"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          VIA
        </h1>

        {/* Tagline */}
        <p
          className="mt-4 text-base md:text-lg text-via-grey-dark max-w-sm"
          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
        >
          Plan the journey.{" "}
          <span className="text-via-black">Live the story.</span>
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center border border-via-black bg-via-black px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-via-white shadow-brutalist transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Start Planning
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center border border-via-black bg-via-white px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-via-black shadow-brutalist transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* ─── Feature Cards ────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-via-black">
          {[
            {
              index: "01",
              title: "Multi-city Itineraries",
              body: "Build day-by-day plans across any number of stops. Drag, reorder, schedule — your trip, your rules.",
            },
            {
              index: "02",
              title: "Budget Tracking",
              body: "Log every rupee or dollar. See spend by category per city, and keep the whole trip on budget.",
            },
            {
              index: "03",
              title: "Share Your Journey",
              body: "Generate a public link to share your itinerary with friends and family — no account required to view.",
            },
          ].map((card, i) => (
            <div
              key={card.index}
              className={`p-8 border-b border-via-black md:border-b-0${
                i < 2 ? " md:border-r border-via-black" : ""
              }`}
            >
              <span
                className="text-xs text-via-grey-mid"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                {card.index}
              </span>
              <h2
                className="mt-3 text-lg font-semibold text-via-black leading-snug"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {card.title}
              </h2>
              <p
                className="mt-2 text-sm text-via-grey-dark leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-via-grey-light px-8 md:px-16 lg:px-24 py-6 flex items-center justify-between">
        <span
          className="text-xs text-via-grey-mid"
          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
        >
          VIA — Team StormLabs
        </span>
        <span
          className="text-xs text-via-grey-light"
          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
        >
          Odoo Hackathon 2026
        </span>
      </footer>
    </div>
  );
}
