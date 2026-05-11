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
    <div className="min-h-screen bg-via-white flex flex-col selection:bg-via-black selection:text-via-white overflow-hidden">
      {/* ─── Animated Background Layer ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-via-navy/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-via-red/10 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-32 pb-16">
        {/* Wordmark */}
        <div className="relative">
          <h1
            className="text-[clamp(6rem,24vw,18rem)] font-black leading-[0.75] tracking-tighter text-via-black select-none mb-8 mix-blend-multiply"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            VIA
          </h1>
          <div className="absolute -top-6 left-2 font-mono text-[10px] uppercase tracking-[0.4em] text-via-red font-bold">
            Travel Protocol v1.0
          </div>
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-10">
          <p
            className="text-xl md:text-2xl text-via-grey-dark max-w-md font-bold uppercase tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            PLAN THE JOURNEY.{" "}
            <span className="text-via-black underline decoration-via-red decoration-4 underline-offset-8">LIVE THE STORY.</span>
          </p>
          
          <div className="flex flex-wrap gap-5">
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center gap-3 border-2 border-via-black bg-via-black px-12 py-5 text-sm font-bold uppercase tracking-widest text-via-white transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#C1121F]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Start Planning
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center border-2 border-via-black bg-via-white px-12 py-5 text-sm font-bold uppercase tracking-widest text-via-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1B2A41]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Moving Info Band ─────────────────────────────────────────────────── */}
      <div className="relative z-20 bg-via-black py-4 border-y-2 border-via-black overflow-hidden flex">
        <div className="flex animate-marquee-fast whitespace-nowrap gap-12 items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="text-via-white font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Plan the journey. Live the story.</span>
              <Sparkles size={14} className="text-via-red" />
              <span className="text-via-white font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Collaborative Travel Intelligence</span>
              <div className="w-2 h-2 bg-via-white rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Image Carousel (Marquee) ────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden py-20 bg-via-white">
        <div className="flex animate-marquee gap-8 whitespace-nowrap px-8">
          {[...HERO_IMAGES, ...HERO_IMAGES].map((src, i) => (
            <div 
              key={i} 
              className="relative w-72 h-[450px] flex-shrink-0 border-2 border-via-black grayscale hover:grayscale-0 transition-all duration-700 hover:scale-[1.02] cursor-crosshair group shadow-brutalist-sm"
            >
              <Image 
                src={src} 
                alt="Destination" 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-via-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <p className="text-via-white font-mono text-[10px] uppercase tracking-widest font-bold bg-via-black px-3 py-1">Exploring New Frontiers</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-32 bg-via-off-white border-t-2 border-via-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-via-red font-bold">Core Modules</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Engineered for <br/> Pure Exploration
              </h2>
            </div>
            <p className="font-mono text-[11px] text-via-grey-mid max-w-xs uppercase tracking-widest leading-relaxed">
              We stripped away the noise. <br/> No social feeds. No ads. <br/> Just you and the open road.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: <Sparkles size={24} />,
                title: "Smart Stops",
                body: "Algorithmic routing for multi-city chains. Your time is valuable; we treat it as such.",
              },
              {
                icon: <Wallet size={24} />,
                title: "Live Budget",
                body: "Precise expense splitting with real-time settlement tracking for your entire squad.",
              },
              {
                icon: <Camera size={24} />,
                title: "Memory Vault",
                body: "High-fidelity photo archiving with location metadata and collaborative captions.",
              },
              {
                icon: <Share2 size={24} />,
                title: "Squad Sync",
                body: "Real-time collaboration across devices. Plan your journey as a unified unit.",
              },
            ].map((f, i) => (
              <div 
                key={i} 
                className="group relative p-10 border-2 border-via-black bg-via-white hover:-translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#111] hover:shadow-[8px_8px_0px_#111]"
              >
                <div className="w-14 h-14 border-2 border-via-black flex items-center justify-center bg-via-white group-hover:bg-via-black group-hover:text-via-white transition-colors mb-6">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {f.title}
                </h3>
                <p className="text-[13px] text-via-grey-dark leading-relaxed font-inter">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t-2 border-via-black bg-via-white px-8 md:px-16 lg:px-24 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="font-grotesk font-black text-4xl tracking-tighter">VIA</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-via-grey-mid">
            PLAN THE JOURNEY. LIVE THE STORY.
          </span>
        </div>
        <div className="flex gap-10 font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-via-grey-mid">
          <Link href="/privacy" className="hover:text-via-black hover:underline underline-offset-4">Privacy</Link>
          <Link href="/terms" className="hover:text-via-black hover:underline underline-offset-4">Terms</Link>
          <Link href="https://github.com/StormLabs" className="hover:text-via-black hover:underline underline-offset-4">Source</Link>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee-fast {
          animation: marquee-fast 20s linear infinite;
        }
        .animate-pulse {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
