"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, Star } from "lucide-react";
import { getCityImageUrl, formatCurrency } from "@/lib/utils";
import type { CityData } from "@/types";

interface Props { cities: CityData[] }

export function CitiesClient({ cities }: Props) {
  const [q, setQ] = useState("");
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
              className="bg-via-white border border-via-black overflow-hidden"
              style={{ boxShadow: "3px 3px 0px #111111" }}
            >
              <div className="h-32 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.imageUrl ?? getCityImageUrl(city.name)}
                  alt={city.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3 space-y-1">
                <h3 className="font-grotesk font-bold text-sm text-via-black">{city.name}</h3>
                <div className="flex items-center gap-1.5 text-via-grey-mid">
                  <MapPin size={11} strokeWidth={1.5} />
                  <span className="font-mono text-[11px]">{city.country}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-mono text-[11px] text-via-grey-mid">
                    ~{formatCurrency(city.costIndex * 30)}/day
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={11} strokeWidth={1.5} className="text-via-grey-mid" />
                    <span className="font-mono text-[11px] text-via-grey-mid">
                      {city.popularityScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
