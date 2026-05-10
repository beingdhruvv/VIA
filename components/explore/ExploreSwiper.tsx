"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Info, Star, Globe, MapPin, Bookmark } from "lucide-react";
import { City } from "@prisma/client";

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
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-via-white border border-via-black border-dashed">
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
    <div className="relative w-full max-w-md mx-auto h-[70vh] flex flex-col">
      <div className="relative flex-1 perspective-1000">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentCity.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) handleSwipe("right");
              else if (info.offset.x < -100) handleSwipe("left");
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
              <div className="w-full h-full bg-via-white border-2 border-via-black overflow-hidden relative" style={{ boxShadow: "8px 8px 0px #111111" }}>
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentCity.imageUrl || `https://source.unsplash.com/800x1200/?${currentCity.name},travel`}
                  alt={currentCity.name}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Overlays */}
              <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-20deg]">
                <span className="text-green-500 font-bold text-4xl uppercase">LIKE</span>
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[20deg]">
                <span className="text-red-500 font-bold text-4xl uppercase">NOPE</span>
              </motion.div>

              {/* Bottom Info Gradient */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-white font-grotesk font-bold text-3xl leading-tight">
                      {currentCity.name}, <span className="text-white/80 font-normal">{currentCity.country}</span>
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
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
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md border border-white/20"
                  >
                    <Info size={20} />
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
                    className="absolute inset-0 bg-via-white z-10 p-6 overflow-y-auto"
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
      <div className="flex items-center justify-center gap-8 py-8">
        <button
          onClick={() => handleSwipe("left")}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-via-white border-2 border-via-black text-red-500 hover:bg-red-50 transition-all hover:scale-110 active:scale-95"
          style={{ boxShadow: "4px 4px 0px #111111" }}
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button
          onClick={() => handleSwipe("up")}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-via-white border-2 border-via-black text-via-red hover:bg-blue-50 transition-all hover:scale-110 active:scale-95"
          style={{ boxShadow: "3px 3px 0px #111111" }}
        >
          <Bookmark size={20} strokeWidth={2} />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-via-white border-2 border-via-black text-green-500 hover:bg-green-50 transition-all hover:scale-110 active:scale-95"
          style={{ boxShadow: "4px 4px 0px #111111" }}
        >
          <Heart size={32} strokeWidth={3} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
