"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Star, Plus } from "lucide-react";
import { getCityImageUrl, formatCurrency } from "@/lib/utils";
import type { CityData } from "@/types";

interface Props { cities: CityData[] }

export function CitiesClient({ cities }: Props) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [country, setCountry] = useState("ALL");

  const countries = useMemo(() => {
    const set = new Set(cities.map((c) => c.country));
    return ["ALL", ...Array.from(set).sort()];
  }, [cities]);

  const filtered = useMemo(() =>
    cities.filter((c) =>
      (country === "ALL" || c.country === country) &&
      (q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()))
    ),
    [cities, q, country]
  );

  return (
    <div className="mt-6 space-y-5">
      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-via-grey-mid" strokeWidth={1.5} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cities..."
            className="w-full border border-via-grey-light pl-8 pr-3 py-2 text-sm font-mono outline-none focus:border-via-black"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border border-via-grey-light px-3 py-2 text-sm font-mono outline-none focus:border-via-black bg-via-white"
        >
          {countries.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Countries" : c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-via-grey-mid py-12 text-center">No cities match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((city) => (
            <article
              key={city.id}
              className="bg-via-white border border-via-black overflow-hidden group"
              style={{ boxShadow: "3px 3px 0px #111111" }}
            >
              <div className="h-36 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.imageUrl ?? getCityImageUrl(city.name, city.country)}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getCityImageUrl(city.name, city.country);
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-via-black px-3 py-1.5 flex items-center justify-between">
                  <h3 className="font-grotesk font-bold text-sm text-via-white leading-tight truncate">{city.name}</h3>
                  <div className="flex items-center gap-0.5 ml-2 shrink-0">
                    <Star size={9} className="text-via-grey-light" strokeWidth={1.5} />
                    <span className="font-mono text-[10px] text-via-grey-light">{(city.popularityScore / 10).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-via-grey-mid">
                    <MapPin size={11} strokeWidth={1.5} />
                    <span className="font-mono text-[11px]">{city.country}</span>
                  </div>
                  <span className="font-mono text-[11px] text-via-grey-mid">
                    ~{formatCurrency(city.costIndex * 30)}/day
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Link
                    href={`/cities/${city.id}`}
                    className="flex-1 flex items-center justify-center py-1.5 text-[11px] font-mono uppercase tracking-wider border border-via-grey-light hover:border-via-black transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/trips/new?city=${city.id}&cityName=${encodeURIComponent(city.name)}`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-mono uppercase tracking-wider border border-via-black bg-via-black text-via-white hover:bg-via-navy transition-colors"
                  >
                    <Plus size={10} />
                    Plan Trip
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
