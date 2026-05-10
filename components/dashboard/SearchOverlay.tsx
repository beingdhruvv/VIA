"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  Map
} from "lucide-react";
import { getCityImageUrl } from "@/lib/utils";
import type { CityData, TripCard } from "@/types";

const EMPTY_RESULTS = { cities: [], trips: [] } satisfies { cities: CityData[]; trips: TripCard[] };

export function SearchOverlay({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ cities: CityData[], trips: TripCard[] }>({ cities: [], trips: [] });
  const [searching, setSearching] = useState(false);

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
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          fetch(`/api/cities/search?q=${encodeURIComponent(query)}&limit=5`, { signal: abortController.signal }),
          fetch(`/api/search/trips?q=${encodeURIComponent(query)}&limit=5`, { signal: abortController.signal })
        ]);
        if (abortController.signal.aborted) return;
        const cities = citiesRes.ok ? await citiesRes.json() : [];
        const trips = tripsRes.ok ? await tripsRes.json() : [];
        setResults({ cities, trips });
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleCitySelect = useCallback((city: CityData) => {
    onOpenChange(false);
    setQuery("");
    router.push(`/trips/new?cityName=${encodeURIComponent(city.name)}`);
  }, [onOpenChange, router]);

  const handleTripSelect = useCallback((trip: TripCard) => {
    onOpenChange(false);
    setQuery("");
    router.push(`/trips/${trip.id}`);
  }, [onOpenChange, router]);

  const displayedResults = query.length < 2 ? EMPTY_RESULTS : results;
  const totalResults = displayedResults.cities.length + displayedResults.trips.length;

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
        className="relative w-full max-w-2xl min-w-0 bg-via-white border-4 border-via-black animate-in fade-in slide-in-from-top-4 duration-300 my-4"
      >
        <div className="flex items-center min-w-0 border-b-2 border-via-black px-3 sm:px-4">
          <Search size={20} className="text-via-grey-mid shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              if (nextQuery.length < 2) {
                setResults(EMPTY_RESULTS);
                setSearching(false);
              }
            }}
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
              {displayedResults.cities.length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest mb-2">Destinations</p>
                  <div className="space-y-1">
                    {displayedResults.cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        className="w-full flex items-center gap-4 px-3 py-3 hover:bg-via-black hover:text-via-white transition-colors text-left group"
                      >
                        <div className="w-10 h-10 border border-via-black overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getCityImageUrl(city.name, city.country)}
                            alt={city.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
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

              {displayedResults.trips.length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-mono text-via-grey-mid uppercase tracking-widest mb-2">My Trips</p>
                  <div className="space-y-1">
                    {displayedResults.trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => handleTripSelect(trip)}
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
              <p className="font-grotesk font-bold text-via-black text-lg">No results for &quot;{query}&quot;</p>
              <p className="font-mono text-xs text-via-grey-mid uppercase tracking-widest">Try a different search term</p>
            </div>
          )}
        </div>

        <div className="border-t-4 border-via-black px-4 py-3 bg-via-black flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono text-via-white uppercase tracking-widest">
            <span className="flex items-center gap-1"><kbd className="border border-white/20 px-1 bg-white/10">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="border border-white/20 px-1 bg-white/10">↑↓</kbd> Navigate</span>
          </div>
          <p className="text-[10px] font-mono text-via-white font-bold uppercase tracking-widest">VIA Global Search</p>
        </div>
      </div>
    </div>
  );
}
