"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Star, Globe, Bookmark, RotateCcw, SlidersHorizontal } from "lucide-react";
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

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    const city = cities[currentIndex];
    if (!city) return;

    let type: "LIKE" | "DISLIKE" | "SAVE" = "DISLIKE";
    if (direction === "right") type = "LIKE";
    if (direction === "up") type = "SAVE";

    // Record history for undo
    setHistory((prev) => [...prev, currentIndex]);

    // Call API in background
    fetch("/api/user/taste", {
      method: "POST",
      body: JSON.stringify({ cityId: city.id, type }),
    });

    // Advance to next card
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = async () => {
    if (history.length === 0) return;
    
    const lastIndex = history[history.length - 1];
    const city = cities[lastIndex];
    
    // Remove from history
    setHistory((prev) => prev.slice(0, -1));
    
    // Remove taste record via API
    fetch("/api/user/taste", {
      method: "DELETE",
      body: JSON.stringify({ cityId: city.id }),
    });
    
    // Set current index back
    setCurrentIndex(lastIndex);
  };

  useEffect(() => {
    // If we're running low on cities, fetch more
    if (cities.length - currentIndex < 3) {
      fetch("/api/cities/explore")
        .then((res) => res.json())
        .then((data: ExploreCity[]) => {
          if (Array.isArray(data)) {
            setCities((prev) => [...prev, ...data.filter(d => !prev.find(p => p.id === d.id))]);
          }
        });
    }
  }, [currentIndex, cities.length]);

  if (currentIndex >= cities.length) {
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

  const currentCity = cities[currentIndex];

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[min(100%,22rem)] flex-1 flex-col sm:max-w-md">
      <div className="relative min-h-[220px] flex-1 perspective-1000 sm:min-h-[280px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentCity.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const t = 70; // Lower threshold
              if (info.offset.x > t) handleSwipe("right");
              else if (info.offset.x < -t) handleSwipe("left");
            }}
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          >
              <div
                className="relative h-full w-full overflow-y-auto border-2 border-via-black bg-via-white scrollbar-hide"
                style={{ boxShadow: "4px 4px 0px var(--foreground)" }}
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full shrink-0 border-b-2 border-via-black">
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
                      className="bg-white border-2 border-via-black p-2 shadow-[2px_2px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-30"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                      className="bg-white border-2 border-via-black p-2 shadow-[2px_2px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  </div>

                  {/* BOTTOM METADATA OVERLAY */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none">
                    <div className="bg-via-white border-2 border-via-black p-4 shadow-[4px_4px_0px_#111] pointer-events-auto">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="font-grotesk text-2xl font-black leading-none text-via-black uppercase italic">
                            {currentCity.name}
                          </h2>
                          <p className="font-mono text-[10px] uppercase text-via-grey-mid tracking-tighter mt-1">
                            {currentCity.country} · {currentCity.region}
                          </p>
                        </div>
                        <div className="bg-via-black text-via-white px-2 py-1 font-mono text-[10px] font-bold">
                          {"$".repeat(Math.ceil(currentCity.costIndex / 25))}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between border-t border-via-grey-light pt-2">
                        <div className="flex items-center gap-1.5 text-via-black font-mono text-[10px] uppercase font-bold">
                          <Star size={12} fill="currentColor" className="text-yellow-500" />
                          {currentCity.popularityScore / 20} Popularity
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
                    <h4 className="font-mono text-[10px] uppercase text-via-grey-mid mb-2 border-b-2 border-via-black pb-1 font-bold">The Vibe</h4>
                    <p className="font-inter text-sm text-via-black leading-snug">
                      Known for its stunning {currentCity.region} landscapes and vibrant culture, {currentCity.name} offers a perfect blend of history and modern amenities.
                    </p>
                  </div>

                  {/* Gallery */}
                  <div className="space-y-2">
                    <h4 className="font-mono text-[10px] uppercase text-via-grey-mid mb-2 border-b border-via-grey-light pb-1">Previews</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white">
                         <Image src={exploreCityImageSrc(currentCity)} alt="preview 1" fill className="object-cover" />
                      </div>
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white">
                         <Image src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=300&fit=crop`} alt="preview 2" fill className="object-cover" />
                      </div>
                      <div className="relative aspect-[4/3] border-2 border-via-black overflow-hidden bg-via-off-white col-span-2">
                         <Image src={`https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&h=300&fit=crop`} alt="preview 3" fill className="object-cover" />
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
                                <p className="text-[10px] font-mono text-via-grey-mid uppercase tracking-wide">₹{act.estimatedCost.toLocaleString()} · {act.category}</p>
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

      {/* Action Buttons */}
      {/* Main Action Buttons */}
      <div className="flex shrink-0 items-center justify-center gap-6 py-6">
        <button
          type="button"
          onClick={() => handleSwipe("left")}
          className="flex h-16 w-16 items-center justify-center border-4 border-via-black bg-via-white text-red-500 shadow-[4px_4px_0px_#111] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
        >
          <X size={32} strokeWidth={4} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("up")}
          className="flex h-12 w-12 items-center justify-center border-2 border-via-black bg-via-white text-via-navy shadow-[2px_2px_0px_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95"
        >
          <Bookmark size={20} strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("right")}
          className="flex h-16 w-16 items-center justify-center border-4 border-via-black bg-via-white text-green-500 shadow-[4px_4px_0px_#111] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95"
        >
          <Heart size={32} strokeWidth={4} fill="currentColor" />
        </button>
      </div>

      {/* Filter Modal Placeholder */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-0 right-0 z-20 mx-auto w-full max-w-xs border-2 border-via-black bg-via-white p-4 shadow-brutalist"
          >
            <div className="flex items-center justify-between mb-3 border-b border-via-black pb-2">
              <h4 className="font-grotesk font-bold text-sm uppercase">Filters</h4>
              <button onClick={() => setShowFilters(false)}><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-via-grey-mid mb-2">Region</p>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "Europe", "Asia", "Americas", "Africa"].map(r => (
                    <button 
                      key={r}
                      onClick={() => setFilters(f => ({ ...f, region: r }))}
                      className={`text-[10px] font-mono py-1.5 border ${filters.region === r ? 'bg-via-black text-via-white border-via-black' : 'bg-via-off-white border-via-grey-light'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowFilters(false);
                // Trigger refresh with filters
                setCurrentIndex(0);
                setHistory([]);
                setCities(initialCities); // Reset or fetch filtered
              }}
              className="w-full mt-4 bg-via-navy text-via-white py-2 font-mono text-xs uppercase tracking-widest"
            >
              Apply Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
