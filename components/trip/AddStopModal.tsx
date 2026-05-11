"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, ChevronRight, ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCityImageUrl } from "@/lib/utils";
import type { CityData } from "@/types";

const RECENT_KEY = "via_recent_city_searches";

function getRecentSearches(): CityData[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(city: CityData) {
  if (typeof window === "undefined") return;
  const prev = getRecentSearches().filter((c) => c.id !== city.id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([city, ...prev].slice(0, 5)));
}

interface AddStopModalProps {
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStopAdded: () => void;
}

type Step = "search" | "dates";

export function AddStopModal({
  tripId,
  tripStartDate,
  tripEndDate,
  open,
  onOpenChange,
  onStopAdded,
}: AddStopModalProps) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityData[]>([]);
  const [recent, setRecent] = useState<CityData[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [startDate, setStartDate] = useState(tripStartDate.slice(0, 10));
  const [endDate, setEndDate] = useState(tripStartDate.slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("search");
      setQuery("");
      setResults([]);
      setSelectedCity(null);
      setError("");
      setRecent(getRecentSearches());
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/cities/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) { setResults([]); return; }
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  function selectCity(city: CityData) {
    setSelectedCity(city);
    saveRecentSearch(city);
    setStep("dates");
  }

  async function handleConfirm() {
    if (!selectedCity) return;
    setError("");
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }
    if (new Date(startDate) < new Date(tripStartDate) || new Date(endDate) > new Date(tripEndDate)) {
      setError("Stop dates must fall within trip dates");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: selectedCity.id, startDate, endDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add stop");
        return;
      }
      onOpenChange(false);
      onStopAdded();
    } finally {
      setSubmitting(false);
    }
  }

  const displayList = query.length >= 2 ? results : recent;
  const listLabel = query.length >= 2 ? "Results" : "Recent Searches";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md w-full mx-auto">
        <ModalHeader
          title={step === "search" ? "Add a Stop" : `Dates for ${selectedCity?.name}`}
        />

        {step === "search" ? (
          <div className="p-5 space-y-4">
            <Input
              placeholder="Search city or country…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />

            {searching && (
              <p className="text-xs text-via-grey-mid font-mono animate-pulse">Searching…</p>
            )}

            {displayList.length > 0 && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-via-grey-mid mb-2">
                  {listLabel}
                </p>
                <ul className="space-y-0 border border-via-grey-light divide-y divide-via-grey-light">
                  {displayList.map((city) => (
                    <li key={city.id}>
                      <button
                        onClick={() => selectCity(city)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-via-off-white transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 shrink-0 border border-via-grey-light">
                          <Image
                            src={city.imageUrl ?? getCityImageUrl(city.name, city.country)}
                            alt={city.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-via-black truncate">{city.name}</p>
                          <p className="text-xs text-via-grey-mid flex items-center gap-1">
                            <MapPin size={10} />
                            {city.country} · {city.region}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-mono text-via-grey-mid uppercase tracking-tighter">
                            Cost Index
                          </p>
                          <p className="text-xs font-mono font-bold text-via-black">
                            {city.costIndex.toFixed(1)}/5.0
                          </p>
                          <ChevronRight size={14} className="text-via-grey-mid ml-auto mt-1" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-via-grey-mid text-center py-4">
                No cities found for &ldquo;{query}&rdquo;
              </p>
            )}

            {query.length === 0 && recent.length === 0 && (
              <p className="text-sm text-via-grey-mid text-center py-4">
                Start typing to search cities
              </p>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <button
              onClick={() => setStep("search")}
              className="flex items-center gap-1.5 text-xs text-via-grey-mid hover:text-via-black transition-colors"
            >
              <ArrowLeft size={13} /> Back to search
            </button>

            <div className="bg-via-off-white border border-via-grey-light p-3 flex items-center gap-2">
              <MapPin size={14} className="text-via-navy shrink-0" />
              <div>
                <p className="text-sm font-medium text-via-black">{selectedCity?.name}</p>
                <p className="text-xs text-via-grey-mid">{selectedCity?.country}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-via-black flex items-center gap-1">
                  <Calendar size={13} /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={tripStartDate.slice(0, 10)}
                  max={tripEndDate.slice(0, 10)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-via-off-white px-3 py-2 text-sm font-mono text-via-black border border-via-grey-light rounded-none outline-none focus:border-2 focus:border-via-black"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-via-black flex items-center gap-1">
                  <Calendar size={13} /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={tripEndDate.slice(0, 10)}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-via-off-white px-3 py-2 text-sm font-mono text-via-black border border-via-grey-light rounded-none outline-none focus:border-2 focus:border-via-black"
                />
              </div>
            </div>

            <p className="text-xs text-via-grey-mid font-mono">
              Trip window: {tripStartDate.slice(0, 10)} → {tripEndDate.slice(0, 10)}
            </p>

            {error && <p className="text-xs text-via-red">{error}</p>}
          </div>
        )}

        {step === "dates" && (
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleConfirm}>
              Add Stop
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
