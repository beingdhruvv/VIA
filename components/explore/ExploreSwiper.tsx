"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Bookmark, Globe, Heart, MapPin, RotateCcw, SlidersHorizontal, Star, X } from "lucide-react";
import type { City } from "@prisma/client";
import { CITY_IMAGES, cityImageKey, FALLBACK_CITY_IMAGE } from "@/lib/place-images";

function exploreCityImageSrc(city: City): string {
  if (city.imageUrl) return city.imageUrl;
  const key = cityImageKey(city.name, city.country);
  return CITY_IMAGES[key] ?? FALLBACK_CITY_IMAGE;
}

interface ExploreCity extends City {
  activities?: Array<{
    id: string;
    name: string;
    estimatedCost: number;
    category: string;
    imageUrl?: string | null;
  }>;
  moreImages?: string[];
}

interface ExploreSwiperProps {
  initialCities: ExploreCity[];
}

export function ExploreSwiper({ initialCities }: ExploreSwiperProps) {
  const [cities, setCities] = useState<ExploreCity[]>(initialCities);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    region: "All",
    cost: "All",
  });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(cities.map((city) => city.region))).sort()];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const regionMatches = filters.region === "All" || city.region === filters.region;
      return regionMatches;
    });
  }, [cities, filters]);

  const resetDeckPosition = () => {
    setCurrentIndex(0);
    setHistory([]);
    x.set(0);
  };

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    const city = filteredCities[currentIndex];
    if (!city) return;

    let type: "LIKE" | "DISLIKE" | "SAVE" = "DISLIKE";
    if (direction === "right") type = "LIKE";
    if (direction === "up") type = "SAVE";

    // Record history for undo
    setHistory((prev) => [...prev, currentIndex]);

    void fetch("/api/user/taste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityId: city.id, type }),
    });

    x.set(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = async () => {
    if (history.length === 0) return;
    
    const lastIndex = history[history.length - 1];
    const city = filteredCities[lastIndex];
    if (!city) return;
    
    // Remove from history
    setHistory((prev) => prev.slice(0, -1));
    
    void fetch("/api/user/taste", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityId: city.id }),
    });
    
    // Set current index back
    setCurrentIndex(lastIndex);
  };

  useEffect(() => {
    // If we're running low on visible cities, fetch more candidates.
    if (filteredCities.length - currentIndex < 3) {
      fetch("/api/cities/explore")
        .then((res) => res.json())
        .then((data: ExploreCity[]) => {
          if (Array.isArray(data)) {
            setCities((prev) => [...prev, ...data.filter((d) => !prev.find((p) => p.id === d.id))]);
          }
        });
    }
  }, [currentIndex, filteredCities.length]);

  if (filteredCities.length === 0) {
    return (
      <div className="flex min-h-[36dvh] flex-col items-center justify-center border border-dashed border-via-black bg-via-white px-4 py-8 text-center sm:min-h-[50vh] sm:px-8">
        <SlidersHorizontal className="mb-4 text-via-grey-mid" size={42} />
        <h3 className="font-grotesk text-xl font-bold text-via-black">No matches in this deck</h3>
        <p className="mt-2 max-w-xs font-inter text-sm text-via-grey-mid">
          Adjust the filters to bring destinations back into view.
        </p>
        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setHistory([]);
            setFilters({ region: "All", cost: "All" });
          }}
          className="mt-6 border border-via-black bg-via-black px-6 py-2 font-mono text-xs uppercase tracking-widest text-via-white transition-colors hover:bg-via-navy"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  if (currentIndex >= filteredCities.length) {
    return (
      <div className="flex min-h-[36dvh] flex-col items-center justify-center border border-dashed border-via-black bg-via-white px-4 py-8 text-center sm:min-h-[50vh] sm:px-8">
        <Globe className="text-via-grey-light mb-4" size={48} />
        <h3 className="font-grotesk font-bold text-xl text-via-black">You&apos;ve explored the world!</h3>
        <p className="font-inter text-via-grey-mid mt-2 max-w-xs">
          Check back later for more destinations or update your preferences.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-via-black text-via-white font-mono text-xs uppercase tracking-widest hover:bg-via-navy transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  const currentCity = filteredCities[currentIndex];
  const nextCity = filteredCities[currentIndex + 1];
  const popularity = (currentCity.popularityScore / 20).toFixed(1);

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[min(100%,25rem)] flex-1 flex-col sm:max-w-md">
      <div className="mb-3 grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0}
          className="flex h-10 w-10 items-center justify-center border border-via-black bg-via-white shadow-brutalist-sm disabled:opacity-30"
          aria-label="Undo last swipe"
        >
          <RotateCcw size={16} />
        </button>
        <div className="flex justify-center gap-1.5">
        {filteredCities.slice(currentIndex, currentIndex + 5).map((city, index) => (
          <span
            key={city.id}
            className={`h-1.5 rounded-full border border-via-black ${index === 0 ? "w-8 bg-via-black" : "w-3 bg-via-white"}`}
          />
        ))}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex h-10 w-10 items-center justify-center border border-via-black bg-via-white shadow-brutalist-sm"
          aria-label="Open explore filters"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <div className="relative h-[min(66dvh,660px)] min-h-[500px] shrink-0 perspective-1000 sm:min-h-[580px]">
        {nextCity && (
          <div
            className="absolute inset-x-3 top-4 bottom-0 overflow-hidden border border-via-black bg-via-white opacity-80"
            style={{ boxShadow: "2px 2px 0px var(--foreground)", transform: "rotate(2deg) scale(0.96)" }}
            aria-hidden="true"
          >
            <div className="relative h-full w-full">
              <Image src={exploreCityImageSrc(nextCity)} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-via-white/45" />
            </div>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentCity.id}
            style={{ x, rotate }}
            drag
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              const t = 70; // Optimized threshold
              const velocity = info.velocity.x;
              if (info.offset.y > 85 || info.velocity.y > 500 || info.offset.y < -95 || info.velocity.y < -550) handleSwipe("up");
              else if (info.offset.x > t || velocity > 400) handleSwipe("right");
              else if (info.offset.x < -t || velocity < -400) handleSwipe("left");
              else x.set(0);
            }}
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          >
              <div
                className="relative h-full w-full overflow-hidden border border-via-black bg-via-white"
                style={{ boxShadow: "3px 3px 0px var(--foreground)" }}
              >
                <div className="relative h-full w-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={exploreCityImageSrc(currentCity)}
                      alt={currentCity.name}
                      fill
                      className="pointer-events-none select-none object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  
                  {/* Overlays for swipe direction */}
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute left-6 top-12 rotate-[-12deg] border-4 border-green-500 bg-white/80 px-4 py-1 z-30 pointer-events-none"
                  >
                    <span className="text-4xl font-black uppercase text-green-500 sm:text-5xl">KEEP</span>
                  </motion.div>
                  <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute right-6 top-12 rotate-[12deg] border-4 border-red-500 bg-white/80 px-4 py-1 z-30 pointer-events-none"
                  >
                    <span className="text-4xl font-black uppercase text-red-500 sm:text-5xl">PASS</span>
                  </motion.div>

                  <div className="absolute inset-x-0 bottom-0 h-44 bg-via-black/45" />
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-5 text-via-white pointer-events-none">
                      <div>
                          <h2 className="font-grotesk text-4xl font-black leading-none uppercase italic sm:text-5xl">
                            {currentCity.name}
                          </h2>
                          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-via-white">
                            <MapPin size={12} />
                            {currentCity.country} / {currentCity.region}
                          </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold">
                          <Star size={12} fill="currentColor" />
                          {popularity} Popularity
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSwipe("up"); }}
                          className="pointer-events-auto flex items-center gap-1 border border-via-white px-3 py-2 font-mono text-[10px] uppercase font-bold hover:bg-via-white hover:text-via-black"
                        >
                          <Bookmark size={12} /> Save
                        </button>
                      </div>
                  </div>
                </div>
              </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Action Buttons */}
      <div className="flex shrink-0 items-center justify-center gap-5 py-5">
        <button
          type="button"
          onClick={() => handleSwipe("left")}
          className="flex h-14 w-14 items-center justify-center border border-via-black bg-via-white text-red-500 shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
          aria-label="Pass destination"
        >
          <X size={32} strokeWidth={4} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("up")}
          className="flex h-12 w-12 items-center justify-center border border-via-black bg-via-white text-via-navy shadow-brutalist-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95"
          aria-label="Save destination"
        >
          <Bookmark size={20} strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("right")}
          className="flex h-14 w-14 items-center justify-center border border-via-black bg-via-white text-green-500 shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
          aria-label="Like destination"
        >
          <Heart size={32} strokeWidth={4} fill="currentColor" />
        </button>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-0 right-0 z-20 mx-auto w-full max-w-xs border border-via-black bg-via-white p-4 shadow-brutalist"
          >
            <div className="flex items-center justify-between mb-3 border-b border-via-black pb-2">
              <h4 className="font-grotesk font-bold text-sm uppercase">Filters</h4>
              <button type="button" aria-label="Close filters" onClick={() => setShowFilters(false)}><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
              <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-2">Region</p>
                <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
                  {regions.map(r => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => {
                        resetDeckPosition();
                        setFilters((f) => ({ ...f, region: r }));
                      }}
                      className={`text-[10px] font-mono py-1.5 border ${filters.region === r ? 'bg-via-black text-via-white border-via-black' : 'bg-via-off-white border-via-grey-light'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => {
                setShowFilters(false);
                setCurrentIndex(0);
                setHistory([]);
              }}
              className="w-full mt-4 border border-via-black bg-via-navy py-2 font-mono text-xs uppercase tracking-widest text-via-white"
            >
              Show {filteredCities.length} Cities
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
