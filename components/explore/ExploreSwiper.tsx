"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Info, Star, Globe, MapPin, Bookmark, RotateCcw, SlidersHorizontal, Check } from "lucide-react";
import type { City } from "@prisma/client";
import { CITY_IMAGES, cityImageKey, FALLBACK_CITY_IMAGE } from "@/lib/place-images";

function exploreCityImageSrc(city: City): string {
  if (city.imageUrl) return city.imageUrl;
  const key = cityImageKey(city.name, city.country);
  return CITY_IMAGES[key] ?? FALLBACK_CITY_IMAGE;
}

interface ExploreSwiperProps {
  initialCities: City[];
}

export function ExploreSwiper({ initialCities }: ExploreSwiperProps) {
  const [cities, setCities] = useState<City[]>(initialCities);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
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
    setShowInfo(false);
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
    setShowInfo(false);
  };

  useEffect(() => {
    // If we're running low on cities, fetch more
    if (cities.length - currentIndex < 3) {
      fetch("/api/cities/explore")
        .then((res) => res.json())
        .then((data) => {
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
              const t = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 72 : 100;
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exploreCityImageSrc(currentCity)}
                    alt={currentCity.name}
                    className="pointer-events-none h-full w-full select-none object-cover"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlays */}
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute left-3 top-4 rotate-[-16deg] border-4 border-green-500 px-2 py-1 z-10"
                  >
                    <span className="text-2xl font-bold uppercase text-green-500 sm:text-4xl">LIKE</span>
                  </motion.div>
                  <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute right-3 top-4 rotate-[16deg] border-4 border-red-500 px-2 py-1 z-10"
                  >
                    <span className="text-2xl font-bold uppercase text-red-500 sm:text-4xl">NOPE</span>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h2 className="font-grotesk text-2xl font-bold leading-tight text-via-black sm:text-3xl">
                      {currentCity.name},{" "}
                      <span className="font-normal text-via-grey-mid">{currentCity.country}</span>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-bold text-via-black">{currentCity.popularityScore / 20}</span>
                      </div>
                      <div className="w-px h-3 bg-via-grey-light" />
                      <div className="flex items-center gap-1 text-via-grey-mid text-xs font-mono">
                        <MapPin size={14} />
                        {currentCity.region}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-via-black bg-via-off-white">
                      <span className="block font-mono text-[10px] uppercase text-via-grey-mid mb-1">Cost Index</span>
                      <span className="font-bold text-via-black">
                        {"$".repeat(Math.ceil(currentCity.costIndex / 25))}
                      </span>
                    </div>
                    <div className="p-3 border border-via-black bg-via-off-white">
                      <span className="block font-mono text-[10px] uppercase text-via-grey-mid mb-1">Region</span>
                      <span className="font-bold text-via-black truncate block">
                        {currentCity.region}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-mono text-xs uppercase text-via-grey-mid mb-2 border-b border-via-grey-light pb-1">About</h4>
                    <p className="font-inter text-sm text-via-black leading-relaxed">
                      Known for its stunning {currentCity.region} landscapes and vibrant culture, {currentCity.name} offers a perfect blend of history and modern amenities. Explore the local architecture, cuisine, and hidden gems.
                    </p>
                  </div>

                  {/* Activities Preview (if available) */}
                  {(currentCity as any).activities?.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs uppercase text-via-grey-mid mb-3 border-b border-via-grey-light pb-1">Top Activities</h4>
                      <div className="space-y-3">
                        {(currentCity as any).activities.map((act: any) => (
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
      <div className="flex shrink-0 items-center justify-center gap-4 py-3 sm:gap-6 sm:py-6">
        <button
          type="button"
          onClick={handleUndo}
          disabled={history.length === 0}
          className={`flex h-11 w-11 items-center justify-center border-2 border-via-black bg-via-white transition-all hover:scale-105 active:scale-95 ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'text-via-black'}`}
          style={{ boxShadow: history.length > 0 ? "2px 2px 0px #111111" : "none" }}
          title="Undo last swipe"
        >
          <RotateCcw size={18} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("left")}
          className="flex h-14 w-14 items-center justify-center border-2 border-via-black bg-via-white text-red-500 transition-all hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <X size={26} strokeWidth={3} className="sm:h-8 sm:w-8" />
        </button>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex h-11 w-11 items-center justify-center border-2 border-via-black bg-via-white text-via-navy transition-all hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
          style={{ boxShadow: "2px 2px 0px #111111" }}
          title="Filter places"
        >
          <SlidersHorizontal size={18} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => handleSwipe("right")}
          className="flex h-14 w-14 items-center justify-center border-2 border-via-black bg-via-white text-green-500 transition-all hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <Heart size={26} strokeWidth={3} fill="currentColor" className="sm:h-8 sm:w-8" />
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
