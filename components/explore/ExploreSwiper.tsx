"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Bookmark, Globe, Heart, RotateCcw, SlidersHorizontal, Star, WalletCards, X } from "lucide-react";
import type { City } from "@prisma/client";
import { CITY_IMAGES, cityImageKey, FALLBACK_CITY_IMAGE } from "@/lib/place-images";

function exploreCityImageSrc(city: City): string {
  if (city.imageUrl) return city.imageUrl;
  const key = cityImageKey(city.name, city.country);
  return CITY_IMAGES[key] ?? FALLBACK_CITY_IMAGE;
}

const PREVIEW_FALLBACKS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&h=400&fit=crop",
];

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

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(cities.map((city) => city.region))).sort()];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const regionMatches = filters.region === "All" || city.region === filters.region;
      const costMatches =
        filters.cost === "All" ||
        (filters.cost === "Budget" && city.costIndex <= 35) ||
        (filters.cost === "Balanced" && city.costIndex > 35 && city.costIndex <= 70) ||
        (filters.cost === "Premium" && city.costIndex > 70);

      return regionMatches && costMatches;
    });
  }, [cities, filters]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

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
  const priceLevel = Math.max(1, Math.min(4, Math.ceil(currentCity.costIndex / 25)));
  const popularity = (currentCity.popularityScore / 20).toFixed(1);

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[min(100%,22rem)] flex-1 flex-col sm:max-w-md">
      <div className="mb-2 flex shrink-0 justify-center gap-1.5">
        {filteredCities.slice(currentIndex, currentIndex + 5).map((city, index) => (
          <span
            key={city.id}
            className={`h-1.5 rounded-full border border-via-black ${index === 0 ? "w-8 bg-via-black" : "w-3 bg-via-white"}`}
          />
        ))}
      </div>
      <div className="relative min-h-[220px] flex-1 perspective-1000 sm:min-h-[280px]">
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
              if (info.offset.y < -85 || info.velocity.y < -500) handleSwipe("up");
              else if (info.offset.x > t || velocity > 400) handleSwipe("right");
              else if (info.offset.x < -t || velocity < -400) handleSwipe("left");
              else x.set(0);
            }}
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          >
              <div
                className="relative h-full w-full overflow-y-auto border border-via-black bg-via-white scrollbar-hide"
                style={{ boxShadow: "3px 3px 0px var(--foreground)" }}
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full shrink-0 border-b border-via-black">
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

                  {/* Corner Controls */}
                  <div className="absolute top-4 left-4 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUndo(); }}
                      disabled={history.length === 0}
                      className="border border-via-black bg-via-white p-2 shadow-brutalist-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-30"
                      aria-label="Undo last swipe"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                      className="border border-via-black bg-via-white p-2 shadow-brutalist-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                      aria-label="Open explore filters"
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  </div>

                  {/* BOTTOM METADATA OVERLAY */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-3 pointer-events-none">
                    <div className="bg-via-white border border-via-black p-4 shadow-brutalist pointer-events-auto">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="font-grotesk text-2xl font-black leading-none text-via-black uppercase italic">
                            {currentCity.name}
                          </h2>
                          <p className="font-mono text-[10px] uppercase text-via-grey-mid tracking-tighter mt-1">
                            {currentCity.country} / {currentCity.region}
                          </p>
                        </div>
                        <div className="bg-via-black text-via-white px-2 py-1 font-mono text-[10px] font-bold">
                          {"$".repeat(priceLevel)}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between border-t border-via-grey-light pt-2">
                        <div className="flex items-center gap-1.5 text-via-black font-mono text-[10px] uppercase font-bold">
                          <Star size={12} fill="currentColor" className="text-yellow-500" />
                          {popularity} Popularity
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSwipe("up"); }}
                          className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold hover:text-via-navy underline decoration-2 underline-offset-2"
                        >
                          <Bookmark size={12} /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simplified Content Section (only for details scroll) */}
                <div className="p-5 space-y-6">
                  <div>
                    <h4 className="font-mono text-[10px] uppercase text-via-grey-mid mb-2 border-b border-via-black pb-1 font-bold">The Vibe</h4>
                    <p className="font-inter text-sm text-via-black leading-snug">
                      Known for its stunning {currentCity.region} landscapes and vibrant culture, {currentCity.name} offers a perfect blend of history and modern amenities.
                    </p>
                  </div>

                  {/* Gallery */}
                  <div className="space-y-2">
                    <h4 className="font-mono text-[10px] uppercase text-via-grey-mid mb-2 border-b border-via-grey-light pb-1">Previews</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white">
                         <Image 
                           src={currentCity.moreImages?.[0] || currentCity.activities?.[0]?.imageUrl || PREVIEW_FALLBACKS[currentIndex % PREVIEW_FALLBACKS.length]} 
                           alt="preview 1" fill className="object-cover" 
                         />
                      </div>
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white">
                         <Image 
                           src={currentCity.moreImages?.[1] || currentCity.activities?.[1]?.imageUrl || PREVIEW_FALLBACKS[(currentIndex + 1) % PREVIEW_FALLBACKS.length]} 
                           alt="preview 2" fill className="object-cover" 
                         />
                      </div>
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white col-span-2">
                         <Image 
                           src={currentCity.moreImages?.[2] || currentCity.activities?.[2]?.imageUrl || PREVIEW_FALLBACKS[(currentIndex + 2) % PREVIEW_FALLBACKS.length]} 
                           alt="preview 3" fill className="object-cover" 
                         />
                      </div>
                    </div>
                  </div>

                    {/* Activities Preview (if available) */}
                    {currentCity.activities && currentCity.activities.length > 0 && (
                      <div>
                        <h4 className="font-mono text-xs uppercase text-via-grey-mid mb-3 border-b border-via-grey-light pb-1">Top Activities</h4>
                        <div className="space-y-3">
                          {currentCity.activities.map((act) => (
                            <div key={act.id} className="flex gap-3 items-center">
                              <div className="w-12 h-12 shrink-0 border border-via-black bg-via-off-white flex items-center justify-center">
                                <Star size={16} className="text-via-black" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs truncate uppercase">{act.name}</p>
                                <p className="text-[10px] font-mono text-via-grey-mid uppercase tracking-wide">INR {act.estimatedCost.toLocaleString()} / {act.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="pt-4 flex flex-col gap-2">
                    <button 
                      onClick={() => handleSwipe("up")}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-via-black text-via-white font-mono text-xs uppercase tracking-widest hover:bg-via-navy transition-all border-2 border-via-black"
                    >
                      <Bookmark size={16} />
                      Save to Wishlist
                    </button>
                    <p className="text-[10px] font-mono text-via-grey-mid text-center uppercase tracking-widest py-2">
                      End of details
                    </p>
                  </div>
                </div>
              </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Action Buttons */}
      <div className="flex shrink-0 items-center justify-center gap-6 py-6">
        <button
          type="button"
          onClick={() => handleSwipe("left")}
          className="flex h-16 w-16 items-center justify-center border border-via-black bg-via-white text-red-500 shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
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
          className="flex h-16 w-16 items-center justify-center border border-via-black bg-via-white text-green-500 shadow-brutalist transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
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
                <div className="grid grid-cols-2 gap-2">
                  {regions.slice(0, 8).map(r => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(0);
                        setHistory([]);
                        setFilters((f) => ({ ...f, region: r }));
                      }}
                      className={`text-[10px] font-mono py-1.5 border ${filters.region === r ? 'bg-via-black text-via-white border-via-black' : 'bg-via-off-white border-via-grey-light'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase text-via-grey-mid">
                  <WalletCards size={11} /> Budget
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "Budget", "Balanced", "Premium"].map((cost) => (
                    <button
                      key={cost}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(0);
                        setHistory([]);
                        setFilters((f) => ({ ...f, cost }));
                      }}
                      className={`border py-1.5 font-mono text-[10px] ${filters.cost === cost ? "border-via-black bg-via-black text-via-white" : "border-via-grey-light bg-via-off-white text-via-black"}`}
                    >
                      {cost}
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
