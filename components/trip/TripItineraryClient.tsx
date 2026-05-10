"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Share2,
  List,
  LayoutList,
  Copy,
  Check,
  Clock,
  DollarSign,
  Calendar,
  Pencil,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActivityBadge, StatusBadge } from "@/components/ui/Badge";
import { Modal, ModalContent, ModalHeader, ModalFooter } from "@/components/ui/Modal";
import { TripSubNav } from "@/components/trip/TripSubNav";
import { RouteMap } from "@/components/trip/RouteMap";
import { formatCurrency, formatDateRange, diffInDays } from "@/lib/utils";
import type { TripFull, StopWithCity, ActivityCategory } from "@/types";

interface TripItineraryClientProps {
  trip: TripFull;
}

type ViewMode = "timeline" | "list";

// Build a flat day-by-day schedule from stops
function buildDaySchedule(stops: StopWithCity[]) {
  const days: Array<{
    date: string;
    dayLabel: string;
    stop: StopWithCity;
    activities: StopWithCity["activities"];
  }> = [];

  stops.forEach((stop) => {
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const nights = diffInDays(start, end);
    const numDays = Math.max(nights, 1);

    for (let d = 0; d < numDays; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + d);
      const dateStr = date.toISOString().slice(0, 10);

      // Activities scheduled on this date, or unscheduled (distribute on day 0)
      const dayActivities =
        d === 0
          ? stop.activities.filter(
              (a) =>
                !a.scheduledDate ||
                a.scheduledDate.slice(0, 10) === dateStr
            )
          : stop.activities.filter(
              (a) => a.scheduledDate && a.scheduledDate.slice(0, 10) === dateStr
            );

      days.push({
        date: dateStr,
        dayLabel: date.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }).toUpperCase(),
        stop,
        activities: dayActivities,
      });
    }
  });

  return days;
}

export function TripItineraryClient({ trip }: TripItineraryClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(
    trip.sharedLinks[0]?.slug ?? null
  );
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const daySchedule = buildDaySchedule(trip.stops);

  const totalEstimatedCost = trip.stops.reduce(
    (sum, stop) =>
      sum + stop.activities.reduce((s, a) => s + a.activity.estimatedCost, 0),
    0
  );

  async function handleShare() {
    if (shareSlug) { setShareOpen(true); return; }
    setSharing(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/share`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      setShareSlug(data.slug);
      setShareOpen(true);
    } finally {
      setSharing(false);
    }
  }

  function copyShareLink() {
    if (!shareSlug) return;
    navigator.clipboard.writeText(`${window.location.origin}/trip/${shareSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalDays = diffInDays(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-via-white">
      {/* ── Header ── */}
      <header className="border-b border-via-black bg-via-white sticky top-14 md:top-0 z-20 no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-[22px] md:text-[28px] font-bold text-via-black leading-tight truncate"
              style={{ fontFamily: "var(--font-space-grotesk, sans-serif)" }}
            >
              {trip.name}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="text-xs text-via-grey-mid font-mono">
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
              <span className="text-via-grey-light">·</span>
              <p className="text-xs font-mono text-via-navy">
                {totalDays}D · {trip.stops.length} STOPS
              </p>
              <StatusBadge status={trip.status} />
              {trip.totalBudget != null && (
                <span className="font-mono text-xs text-via-black border border-via-grey-light px-2 py-0.5">
                  ₹{trip.totalBudget.toLocaleString("en-IN")} BUDGET
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            {/* View toggle */}
            <div className="hidden sm:flex border border-via-black">
              <button
                onClick={() => setViewMode("timeline")}
                className={[
                  "flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors",
                  viewMode === "timeline"
                    ? "bg-via-black text-via-white"
                    : "bg-via-white text-via-grey-mid hover:text-via-black",
                ].join(" ")}
                aria-label="Timeline view"
              >
                <LayoutList size={13} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={[
                  "flex items-center gap-1 px-2.5 py-1.5 text-xs border-l border-via-black transition-colors",
                  viewMode === "list"
                    ? "bg-via-black text-via-white"
                    : "bg-via-white text-via-grey-mid hover:text-via-black",
                ].join(" ")}
                aria-label="List view"
              >
                <List size={13} />
              </button>
            </div>

            <Link href={`/trips/${trip.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil size={13} />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>

            <Link href={`/trips/${trip.id}/builder`}>
              <Button variant="secondary" size="sm">
                <Wrench size={13} />
                <span className="hidden sm:inline">Builder</span>
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="hidden sm:inline-flex"
            >
              <Printer size={13} />
              Print
            </Button>

            <Button size="sm" loading={sharing} onClick={handleShare}>
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-3xl mx-auto px-4">
          <TripSubNav tripId={trip.id} />
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Route map — rendered when stops have coordinates */}
        {trip.stops.length > 1 && (
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-via-grey-mid mb-2">Route Map</p>
            <RouteMap stops={trip.stops} />
          </div>
        )}

        {trip.stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-via-grey-mid mb-4">No stops added yet.</p>
            <Link href={`/trips/${trip.id}/builder`}>
              <Button>Open Builder</Button>
            </Link>
          </div>
        ) : viewMode === "timeline" ? (
          /* ── TIMELINE VIEW ── */
          <div className="space-y-0">
            {daySchedule.map((day, idx) => {
              const isNewStop =
                idx === 0 || daySchedule[idx - 1].stop.id !== day.stop.id;

              return (
                <div key={`${day.stop.id}-${day.date}`}>
                  {/* City section header — only when stop changes */}
                  {isNewStop && (
                    <div className="bg-via-navy text-via-white px-4 py-3 flex items-center justify-between mt-6 first:mt-0">
                      <div>
                        <p className="font-bold text-sm font-grotesk">
                          {day.stop.city.name}
                        </p>
                        <p className="text-xs font-mono text-via-grey-light mt-0.5">
                          {day.stop.city.country} · {formatDateRange(day.stop.startDate, day.stop.endDate)}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-via-grey-light">
                        {diffInDays(day.stop.startDate, day.stop.endDate)}N
                      </span>
                    </div>
                  )}

                  {/* Day row */}
                  <div className="border-b border-via-grey-light">
                    <div className="flex items-stretch">
                      {/* Date column */}
                      <div className="w-20 shrink-0 border-r border-via-grey-light flex flex-col items-center justify-start pt-4 pb-2 px-2">
                        <p className="font-mono text-[10px] text-via-grey-mid uppercase tracking-wider leading-none">
                          {day.dayLabel.split(" ")[0]}
                        </p>
                        <p className="font-mono text-lg font-medium text-via-black leading-tight mt-0.5">
                          {day.dayLabel.split(" ")[1]}
                        </p>
                        <p className="font-mono text-[10px] text-via-grey-mid leading-none">
                          {day.dayLabel.split(" ")[2]}
                        </p>
                      </div>

                      {/* Activities */}
                      <div className="flex-1 py-3 px-4">
                        {day.activities.length === 0 ? (
                          <p className="text-xs text-via-grey-mid italic py-1">
                            No activities scheduled
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {day.activities.map((sa) => (
                              <li
                                key={sa.id}
                                className="flex items-start gap-3 py-2 border-l-2 border-via-grey-light pl-3 hover:border-via-navy transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-via-black">
                                      {sa.activity.name}
                                    </p>
                                    <ActivityBadge
                                      category={sa.activity.category as ActivityCategory}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-via-grey-mid">
                                    {sa.scheduledTime && (
                                      <span className="font-mono flex items-center gap-0.5">
                                        <Clock size={10} />
                                        {sa.scheduledTime}
                                      </span>
                                    )}
                                    <span className="font-mono flex items-center gap-0.5">
                                      <DollarSign size={10} />
                                      {formatCurrency(sa.activity.estimatedCost)}
                                    </span>
                                    <span className="font-mono">
                                      {sa.activity.durationHours}h
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="space-y-6">
            {trip.stops.map((stop) => (
              <div key={stop.id} className="border border-via-black" style={{ boxShadow: "3px 3px 0px #111111" }}>
                {/* Stop header */}
                <div className="bg-via-navy text-via-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm font-grotesk">{stop.city.name}</p>
                    <p className="text-xs font-mono text-via-grey-light mt-0.5">
                      {stop.city.country} · {formatDateRange(stop.startDate, stop.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-via-grey-light">
                      {stop.activities.length} activities
                    </p>
                    <p className="text-xs font-mono font-medium text-via-white mt-0.5">
                      {formatCurrency(
                        stop.activities.reduce((s, a) => s + a.activity.estimatedCost, 0)
                      )}
                    </p>
                  </div>
                </div>

                {/* Activities */}
                {stop.activities.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-via-grey-mid text-center">
                    No activities added for this stop
                  </div>
                ) : (
                  <ul className="divide-y divide-via-grey-light">
                    {stop.activities.map((sa) => (
                      <li key={sa.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-via-black">
                              {sa.activity.name}
                            </p>
                            <ActivityBadge
                              category={sa.activity.category as ActivityCategory}
                            />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-via-grey-mid">
                            {sa.scheduledTime && (
                              <span className="font-mono flex items-center gap-0.5">
                                <Clock size={10} />
                                {sa.scheduledTime}
                              </span>
                            )}
                            {sa.scheduledDate && (
                              <span className="font-mono flex items-center gap-0.5">
                                <Calendar size={10} />
                                {sa.scheduledDate.slice(0, 10)}
                              </span>
                            )}
                            <span className="font-mono flex items-center gap-0.5">
                              <DollarSign size={10} />
                              {formatCurrency(sa.activity.estimatedCost)}
                            </span>
                            <span className="font-mono">
                              {sa.activity.durationHours}h
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cost summary footer */}
        {trip.stops.length > 0 && (
          <div className="mt-10 border-t-2 border-via-black pt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-via-black">Total Estimated Cost</p>
            <p className="font-mono text-lg font-bold text-via-black">
              {formatCurrency(totalEstimatedCost)}
            </p>
          </div>
        )}
      </main>

      {/* ── Share Modal ── */}
      <Modal open={shareOpen} onOpenChange={setShareOpen}>
        <ModalContent>
          <ModalHeader title="Share Itinerary" />
          <div className="px-5 py-5 space-y-4">
            <p className="text-sm text-via-grey-mid">
              Share this link to let anyone view your itinerary — no login required.
            </p>
            {shareSlug && (
              <div className="flex items-center gap-2 border border-via-grey-light bg-via-off-white px-3 py-2">
                <p className="text-xs font-mono text-via-black flex-1 min-w-0 truncate">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/trip/${shareSlug}`
                    : `/trip/${shareSlug}`}
                </p>
                <button
                  onClick={copyShareLink}
                  className="shrink-0 text-via-grey-mid hover:text-via-black transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                </button>
              </div>
            )}
          </div>
          <ModalFooter>
            <Button size="sm" onClick={copyShareLink}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
