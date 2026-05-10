"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { getCityImageUrl } from "@/lib/utils";
import type { CityData } from "@/types";

export function GlobalCitySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityData[]>([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setIsOpen(true);
      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (city: CityData) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/trips/new?cityName=${encodeURIComponent(city.name)}`);
  };

  return (
    <div className="relative w-full max-w-2xl" ref={containerRef}>
      <div 
        className="group relative flex min-w-0 items-center bg-via-white border-2 border-via-black transition-all"
        style={{ boxShadow: isOpen ? "0px 0px 0px #111111" : "4px 4px 0px #111111" }}
      >
        <div className="pl-4 text-via-grey-mid">
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Where are you going next?"
          className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4 bg-transparent font-grotesk font-bold text-base sm:text-lg md:text-xl text-via-black outline-none placeholder:text-via-grey-light"
        />
        <div className="pr-4">
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-via-grey-light bg-via-off-white px-1.5 font-mono text-[10px] font-medium text-via-grey-mid">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-0 z-50 bg-via-white border-2 border-t-0 border-via-black"
          style={{ boxShadow: "4px 4px 0px #111111" }}
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-via-grey-light">
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    onClick={() => handleSelect(city)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-via-off-white transition-colors text-left group/item"
                  >
                    <div className="relative w-12 h-12 shrink-0 border border-via-black overflow-hidden">
                      <img
                        src={city.imageUrl ?? getCityImageUrl(city.name, city.country)}
                        alt={city.name}
                        className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-grotesk font-bold text-via-black truncate">{city.name}</p>
                      <p className="font-mono text-[11px] text-via-grey-mid uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} />
                        {city.country}
                      </p>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-via-black" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : !searching && (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-xs text-via-grey-mid">No cities found. Try another search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
