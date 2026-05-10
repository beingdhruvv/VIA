"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Loader2,
  X,
  History,
  TrendingUp,
  Map
} from "lucide-react";
import { getCityImageUrl } from "@/lib/utils";
import type { CityData, TripCard } from "@/types";

export function SearchOverlay({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ cities: CityData[], trips: TripCard[] }>({ cities: [], trips: [] });
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onOpenChange]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ cities: [], trips: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          fetch(`/api/cities/search?q=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/search/trips?q=${encodeURIComponent(query)}&limit=5`)
        ]);
        
        const cities = citiesRes.ok ? await citiesRes.json() : [];
        const trips = tripsRes.ok ? await tripsRes.json() : [];
        
        setResults({ cities, trips });
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((item: any, type: "city" | "trip") => {
    onOpenChange(false);
    setQuery("");
    if (type === "city") {
      router.push(`/trips/new?cityName=${encodeURIComponent(item.name)}`);
    } else {
      router.push(`/trips/${item.id}`);
    }
  }, [onOpenChange, router]);

  const totalResults = results.cities.length + results.trips.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-via-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Search Modal */}
      <div 
        className="relative w-full max-w-2xl min-w-0 bg-via-white border-2 border-via-black animate-in fade-in zoom-in duration-200 my-4"
        style={{ boxShadow: "8px 8px 0px #111111" }}
      >
        <div className="flex items-center min-w-0 border-b-2 border-via-black px-3 sm:px-4">
          <Search size={20} className="text-via-grey-mid shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities, trips, or activities..."
            className="min-w-0 flex-1 px-3 sm:px-4 py-4 sm:py-5 bg-transparent font-grotesk font-bold text-base sm:text-lg md:text-xl text-via-black outline-none placeholder:text-via-grey-light"
          />
          {searching ? (
            <Loader2 size={18} className="animate-spin text-via-grey-mid" />
          ) : (
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-via-grey-light bg-via-off-white px-1.5 font-mono text-[10px] font-medium text-via-grey-mid uppercase">
                Esc
              </kbd>
            </div>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length < 2 ? (
            <div className="py-4 space-y-4">
              <div>
                <p className="px-3 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={12} /> Suggestions
                </p>
                <div className="space-y-1">
                  {["Mumbai", "Paris", "New York", "London"].map((city) => (
                    <button
                      key={city}
                      onClick={() => { setQuery(city); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-via-off-white text-left font-mono text-xs text-via-black transition-colors"
                    >
                      <MapPin size={14} className="text-via-grey-mid" />
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : totalResults > 0 ? (
            <div className="space-y-4 py-2">
              {results.cities.length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest mb-2">Destinations</p>
                  <div className="space-y-1">
                    {results.cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city, "city")}
                        className="w-full flex items-center gap-4 px-3 py-3 hover:bg-via-black hover:text-via-white transition-colors text-left group"
                      >
                        <div className="w-10 h-10 border border-via-black overflow-hidden shrink-0">
                          <img src={getCityImageUrl(city.name, city.country)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-grotesk font-bold text-sm truncate">{city.name}</p>
                          <p className="font-mono text-[10px] opacity-70 uppercase tracking-wider">{city.country}</p>
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.trips.length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest mb-2">My Trips</p>
                  <div className="space-y-1">
                    {results.trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => handleSelect(trip, "trip")}
                        className="w-full flex items-center gap-4 px-3 py-3 hover:bg-via-black hover:text-via-white transition-colors text-left group"
                      >
                        <div className="w-10 h-10 bg-via-navy flex items-center justify-center shrink-0">
                          <Map size={20} className="text-via-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-grotesk font-bold text-sm truncate">{trip.name}</p>
                          <p className="font-mono text-[10px] opacity-70 uppercase tracking-wider">
                            {new Date(trip.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !searching && (
            <div className="py-20 text-center space-y-2">
              <p className="font-grotesk font-bold text-via-black text-lg">No results for "{query}"</p>
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-widest">Try a different search term</p>
            </div>
          )}
        </div>

        <div className="border-t-2 border-via-black px-4 py-3 bg-via-off-white flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest">
            <span className="flex items-center gap-1"><kbd className="border border-via-grey-light px-1">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="border border-via-grey-light px-1">↑↓</kbd> Navigate</span>
          </div>
          <p className="text-[10px] font-mono text-via-black font-bold uppercase tracking-widest">StormLabs VIA Search</p>
        </div>
      </div>
    </div>
  );
}
