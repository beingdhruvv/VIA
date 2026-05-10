"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";
import { formatCurrency, getCityImageUrl } from "@/lib/utils";

export type CarouselCity = {
  id: string;
  name: string;
  country: string;
  imageUrl: string | null;
  costIndex: number;
  popularityScore: number;
};

export function RecommendedDestinationsCarousel({ cities }: { cities: CarouselCity[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 320);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  if (cities.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll destinations left"
        onClick={() => scrollBy(-1)}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center border border-via-black bg-via-white shadow-[2px_2px_0_#111] hover:bg-via-off-white -ml-2"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Scroll destinations right"
        onClick={() => scrollBy(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center border border-via-black bg-via-white shadow-[2px_2px_0_#111] hover:bg-via-off-white -mr-2"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cities.map((city) => {
          const img = city.imageUrl ?? `https://picsum.photos/seed/${encodeURIComponent(city.name)}/400/300`;
          const estDaily = formatCurrency(city.costIndex * 30);
          const score = (city.popularityScore / 10).toFixed(1);
          return (
            <Link
              key={city.id}
              href={`/cities/${city.id}`}
              className="group shrink-0 w-[min(280px,78vw)] snap-start border border-via-black bg-via-white flex flex-col overflow-hidden"
              style={{ boxShadow: "3px 3px 0px #111111" }}
            >
              <div className="relative h-36 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getCityImageUrl(city.name);
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-via-navy px-3 py-2 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-grotesk font-bold text-sm text-via-white truncate">{city.name}</p>
                    <p className="font-mono text-[9px] text-via-grey-light uppercase tracking-wider truncate">
                      {city.country}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-via-white border border-via-white/40 px-1.5 py-0.5 shrink-0">
                    {score}
                  </span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between gap-2 border-t border-via-grey-light">
                <span className="font-mono text-[10px] uppercase tracking-wider text-via-grey-mid">Est. / day</span>
                <span className="font-mono text-xs font-semibold text-via-black">{estDaily}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
