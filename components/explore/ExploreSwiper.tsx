"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Info, Star, Globe, MapPin, Bookmark } from "lucide-react";
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

    // Call API in background
    fetch("/api/user/taste", {
      method: "POST",
      body: JSON.stringify({ cityId: city.id, type }),
    });

    // Advance to next card
    setCurrentIndex((prev) => prev + 1);
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
                className="relative h-full min-h-[200px] w-full overflow-hidden border-2 border-via-black bg-via-white sm:min-h-[240px]"
                style={{ boxShadow: "4px 4px 0px var(--foreground)" }}
              >
                {/* Image — Wikimedia / seed URLs only (Unsplash source is unreliable). */}
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
                className="absolute left-3 top-4 rotate-[-16deg] border-4 border-green-500 px-2 py-1 sm:left-6 sm:top-8 sm:px-4 sm:py-2"
              >
                <span className="text-2xl font-bold uppercase text-green-500 sm:text-4xl">LIKE</span>
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute right-3 top-4 rotate-[16deg] border-4 border-red-500 px-2 py-1 sm:right-6 sm:top-8 sm:px-4 sm:py-2"
              >
                <span className="text-2xl font-bold uppercase text-red-500 sm:text-4xl">NOPE</span>
              </motion.div>

              {/* Bottom Info Gradient */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-12 sm:p-6 sm:pt-20">
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-grotesk text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                      {currentCity.name},{" "}
                      <span className="font-normal text-white/80">{currentCity.country}</span>
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2 sm:gap-3">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-white">{currentCity.popularityScore / 20}</span>
                      </div>
                      <div className="w-px h-3 bg-white/20" />
                      <div className="flex items-center gap-1 text-white/80 text-xs font-mono">
                        <MapPin size={12} />
                        {currentCity.region}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="shrink-0 border border-white/20 bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:p-3"
                  >
                    <Info size={18} className="sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Info Panel Overlay */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="absolute inset-0 z-10 overflow-y-auto bg-via-white p-4 sm:p-6"
                  >
                    <button 
                      onClick={() => setShowInfo(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-via-off-white transition-colors border border-via-black"
                    >
                      <X size={20} />
                    </button>
                    
                    <h3 className="font-grotesk font-bold text-2xl text-via-black mb-4">About {currentCity.name}</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border border-via-black bg-via-off-white">
                          <span className="block font-mono text-[10px] uppercase text-via-grey-mid mb-1">Cost Index</span>
                          <span className="font-bold text-via-black">
                            {"$".repeat(Math.ceil(currentCity.costIndex / 25))}
                          </span>
                        </div>
                        <div className="p-3 border border-via-black bg-via-off-white">
                          <span className="block font-mono text-[10px] uppercase text-via-grey-mid mb-1">Coordinates</span>
                          <span className="font-mono text-xs text-via-black">
                            {currentCity.latitude.toFixed(2)}°, {currentCity.longitude.toFixed(2)}°
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-mono text-xs uppercase text-via-grey-mid mb-2 border-b border-via-grey-light pb-1">Why visit?</h4>
                        <p className="font-inter text-sm text-via-black leading-relaxed">
                          Known for its stunning {currentCity.region} landscapes and vibrant culture, {currentCity.name} offers a perfect blend of history and modern amenities.
                        </p>
                      </div>

                      <div className="flex gap-3">
                         <button 
                          onClick={() => handleSwipe("up")}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-via-black text-via-white font-mono text-xs uppercase tracking-widest hover:bg-via-navy transition-all"
                        >
                          <Bookmark size={16} />
                          Add to Wishlist
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 items-center justify-center gap-4 py-3 sm:gap-8 sm:py-6">
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
          onClick={() => handleSwipe("up")}
          className="flex h-11 w-11 items-center justify-center border-2 border-via-black bg-via-white text-via-red transition-all hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
          style={{ boxShadow: "2px 2px 0px #111111" }}
        >
          <Bookmark size={18} strokeWidth={2} className="sm:h-5 sm:w-5" />
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
    </div>
  );
}
