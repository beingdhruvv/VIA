"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Camera, Wallet, Share2 } from "lucide-react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534430480872-3498386e7a56?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-via-white flex flex-col selection:bg-via-black selection:text-via-white">
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20 pb-12 overflow-hidden">
        {/* Wordmark */}
        <h1
          className="text-[clamp(6rem,20vw,14rem)] font-bold leading-[0.8] tracking-tighter text-via-black select-none mb-6"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          VIA
        </h1>

        {/* Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <p
            className="text-lg md:text-xl text-via-grey-dark max-w-sm font-bold uppercase tracking-tight"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            PLAN THE JOURNEY.{" "}
            <span className="text-via-black block sm:inline">LIVE THE STORY.</span>
          </p>
          
          <div className="hidden lg:block h-px flex-1 bg-via-black mb-2 opacity-20" />
        </div>

        {/* CTA buttons */}
        <div className="mt-12 flex flex-wrap gap-4 z-10">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-3 border-2 border-via-black bg-via-black px-10 py-4 text-sm font-bold uppercase tracking-widest text-via-white shadow-[6px_6px_0px_#111] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Start Planning
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center border-2 border-via-black bg-via-white px-10 py-4 text-sm font-bold uppercase tracking-widest text-via-black shadow-[6px_6px_0px_#111] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* ─── Image Carousel (Marquee) ────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden py-12 border-y-2 border-via-black bg-via-off-white">
        <div className="flex animate-marquee gap-6 whitespace-nowrap px-6">
          {[...HERO_IMAGES, ...HERO_IMAGES].map((src, i) => (
            <div 
              key={i} 
              className="relative w-64 h-80 sm:w-80 sm:h-[400px] flex-shrink-0 border-2 border-via-black shadow-[4px_4px_0px_#111]"
            >
              <Image 
                src={src} 
                alt="Destination" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500" 
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 bg-via-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Engineered for <br/> Exploration
            </h2>
            <p className="font-mono text-sm text-via-grey-mid max-w-xs uppercase tracking-widest">
              No clutter. No fluff. <br/> Just your next big adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles size={24} />,
                title: "Smart Stops",
                body: "Intelligent reordering and time-of-day planning for complex multi-city routes.",
              },
              {
                icon: <Wallet size={24} />,
                title: "Live Budget",
                body: "Real-time expense splitting and category tracking in any currency you need.",
              },
              {
                icon: <Camera size={24} />,
                title: "Memory Vault",
                body: "Private, collaborative photo galleries shared only with your trip squad.",
              },
              {
                icon: <Share2 size={24} />,
                title: "Squad Sync",
                body: "Invite collaborators with specific roles. Plan together, travel as one.",
              },
            ].map((f, i) => (
              <div 
                key={i} 
                className="group p-8 border-2 border-via-black bg-via-white hover:bg-via-off-white transition-colors flex flex-col gap-4 shadow-[4px_4px_0px_#111]"
              >
                <div className="w-12 h-12 border-2 border-via-black flex items-center justify-center bg-via-white group-hover:bg-via-black group-hover:text-via-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight mt-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-via-grey-dark leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social / Trust Section ─────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-16 border-t-2 border-via-black bg-via-black text-via-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-2">
            <p className="font-mono text-2xl font-bold tabular-nums">57+ CITIES</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Seeded Destinations</p>
          </div>
          <div className="w-px h-12 bg-via-white/20 hidden md:block" />
          <div className="space-y-2">
            <p className="font-mono text-2xl font-bold tabular-nums">295+ ACTIVITIES</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Curated Experiences</p>
          </div>
          <div className="w-px h-12 bg-via-white/20 hidden md:block" />
          <div className="space-y-2">
            <p className="font-mono text-2xl font-bold tabular-nums">100% PRIVATE</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Your Data, Your Story</p>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t-2 border-via-black bg-via-white px-8 md:px-16 lg:px-24 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="font-grotesk font-black text-2xl">VIA</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-via-grey-mid border-l border-via-grey-light pl-4">
            PLAN THE JOURNEY. LIVE THE STORY.
          </span>
        </div>
        <div className="flex gap-8 font-mono text-[10px] uppercase tracking-widest text-via-grey-mid">
          <Link href="/privacy" className="hover:text-via-black">Privacy</Link>
          <Link href="/terms" className="hover:text-via-black">Terms</Link>
          <Link href="https://github.com/StormLabs" className="hover:text-via-black">Github</Link>
        </div>
      </footer>

      {/* Marquee Animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
