"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn } from "lucide-react";

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
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex min-h-[92svh] flex-col justify-center overflow-hidden px-5 pb-16 pt-24 md:px-16 lg:px-24">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1800&auto=format&fit=crop"
          alt="Mountain road through a travel destination"
          fill
          priority
          className="absolute inset-0 -z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-via-white/78" />
        {/* Wordmark */}
        <div className="relative">
          <h1
            className="text-[clamp(4.8rem,22vw,18rem)] font-black leading-[0.78] text-via-black select-none mb-8 mix-blend-multiply"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            VIA
          </h1>
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-10">
          <p
            className="text-lg md:text-2xl text-via-grey-dark max-w-md font-bold uppercase leading-tight"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            PLAN THE JOURNEY.{" "}
            <span className="text-via-black underline decoration-via-red decoration-4 underline-offset-8">LIVE THE STORY.</span>
          </p>
          
          <div className="max-w-sm border-2 border-via-black bg-via-white p-4 shadow-brutalist">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-via-grey-mid">
              To start planning, create an account or sign in.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center justify-center gap-2 border-2 border-via-black bg-via-black px-5 py-3 text-xs font-bold uppercase text-via-white transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0px_#C1121F]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Start Planning
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-via-black bg-via-white px-5 py-3 text-xs font-bold uppercase text-via-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0px_#1B2A41]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <LogIn size={15} /> Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>


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
          <Link href="https://stromlabs.tech" className="hover:text-via-black hover:underline underline-offset-4">Source</Link>
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
          animation: marquee 26s linear infinite;
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
