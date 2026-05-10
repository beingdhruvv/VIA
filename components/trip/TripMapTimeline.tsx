"use client";

/**
 * TripMapTimeline — Google-Maps-style trip timeline.
 * Left: interactive Leaflet map with numbered stops + route polyline.
 * Right: scrollable stop-by-stop timeline showing dates, activities, transit.
 * Clicking a timeline stop pans the map. Clicking a marker scrolls the timeline.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Plane, Train, Car, Clock, Star, ChevronDown, ChevronUp } from "lucide-react";
import { formatDateRange, formatCurrency, diffInDays, getCityImageUrl } from "@/lib/utils";

interface StopCity {
  id: string; name: string; country: string; region: string;
  latitude: number; longitude: number;
  imageUrl?: string | null;
  costIndex?: number;
  popularityScore?: number;
}

interface StopActivity {
  id: string; activityId: string; scheduledDate?: string | null; scheduledTime?: string | null; actualCost?: number | null;
  activity: { id: string; name: string; estimatedCost: number; durationHours: number; rating: number; category?: string; description?: string; };
}

interface MapStop {
  id: string; tripId?: string; cityId?: string; orderIndex?: number;
  startDate: string; endDate: string; notes?: string | null;
  city: StopCity;
  activities: StopActivity[];
}

interface Props {
  stops: MapStop[];
}

function getTransitMode(from: MapStop, to: MapStop) {
  if (from.city.country !== to.city.country) return "flight";
  const lat1 = from.city.latitude, lon1 = from.city.longitude;
  const lat2 = to.city.latitude, lon2 = to.city.longitude;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (dist > 500) return "flight";
  if (dist > 150) return "train";
  return "drive";
}

function getDistanceKm(from: MapStop, to: MapStop) {
  const lat1 = from.city.latitude, lon1 = from.city.longitude;
  const lat2 = to.city.latitude, lon2 = to.city.longitude;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function TripMapTimeline({ stops }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [activeStop, setActiveStop] = useState<number>(0);
  const [expandedStops, setExpandedStops] = useState<Set<number>>(new Set([0]));
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);

  const flyToStop = useCallback((idx: number) => {
    const map = mapInstanceRef.current as { flyTo: (ll: [number, number], z: number) => void } | null;
    const stop = stops[idx];
    if (!map || !stop) return;
    map.flyTo([stop.city.latitude, stop.city.longitude], 10);
    const marker = markersRef.current[idx] as { openPopup: () => void } | undefined;
    marker?.openPopup();
    setActiveStop(idx);
  }, [stops]);

  const scrollToStop = useCallback((idx: number) => {
    setActiveStop(idx);
    setExpandedStops((prev) => new Set([...prev, idx]));
    stopRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0 || mapInstanceRef.current) return;

    const validStops = stops.filter((s) => s.city.latitude != null && s.city.longitude != null);
    if (validStops.length === 0) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false }).setView(
        [validStops[0].city.latitude, validStops[0].city.longitude], 5
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      L.control.attribution({ prefix: "© OpenStreetMap" }).addTo(map);

      const points: [number, number][] = [];

      validStops.forEach((stop, i) => {
        const lat = stop.city.latitude;
        const lng = stop.city.longitude;
        points.push([lat, lng]);

        const isActive = i === 0;
        const icon = L.divIcon({
          html: `<div style="
            background:${isActive ? "#C1121F" : "#111111"};
            color:#fff;
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-family:monospace;font-size:13px;font-weight:700;
            border:2px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          ">${i + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: "",
        });

        const nights = diffInDays(new Date(stop.startDate), new Date(stop.endDate));
        const actCount = stop.activities.length;

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:monospace;font-size:12px;min-width:160px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${i + 1}. ${stop.city.name}</div>
            <div style="color:#8A8A8A;margin-bottom:4px">${stop.city.country} · ${stop.city.region}</div>
            <div style="color:#1B2A41">${nights} night${nights !== 1 ? "s" : ""} · ${actCount} activit${actCount !== 1 ? "ies" : "y"}</div>
            <div style="margin-top:6px;color:#8A8A8A">${new Date(stop.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → ${new Date(stop.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
          </div>
        `);

        marker.on("click", () => scrollToStop(i));
        markersRef.current.push(marker);
      });

      if (points.length > 1) {
        // Solid route line
        L.polyline(points, { color: "#1B2A41", weight: 3, dashArray: "8,5", opacity: 0.8 }).addTo(map);
        map.fitBounds(points, { padding: [48, 48] });
      } else if (points.length === 1) {
        map.setZoom(10);
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [stops, scrollToStop]);

  // Update active marker colour when activeStop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m, i) => {
        const marker = m as { setIcon: (icon: unknown) => void };
        const icon = L.divIcon({
          html: `<div style="
            background:${i === activeStop ? "#C1121F" : "#111111"};
            color:#fff;
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-family:monospace;font-size:13px;font-weight:700;
            border:2px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          ">${i + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: "",
        });
        marker.setIcon(icon);
      });
    });
  }, [activeStop]);

  if (stops.length === 0) return null;

  return (
    <div className="border border-via-black" style={{ boxShadow: "3px 3px 0px #111111" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-via-grey-light bg-via-white">
        <MapPin size={14} strokeWidth={1.5} className="text-via-grey-mid" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-via-grey-mid">Route Timeline</span>
        <span className="ml-auto font-mono text-[11px] text-via-grey-mid">{stops.length} stops</span>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 520 }}>
        {/* Map */}
        <div ref={mapRef} className="flex-1 min-h-[260px] lg:min-h-0" style={{ minWidth: 0 }} />

        {/* Timeline panel */}
        <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-via-grey-light overflow-y-auto bg-via-white">
          <ul className="py-2">
            {stops.map((stop, idx) => {
              const isActive = activeStop === idx;
              const isExpanded = expandedStops.has(idx);
              const nights = diffInDays(new Date(stop.startDate), new Date(stop.endDate));
              const totalCost = stop.activities.reduce((sum, a) => sum + a.activity.estimatedCost, 0);

              // Transit connector (between stops)
              const prevStop = idx > 0 ? stops[idx - 1] : null;
              const mode = prevStop ? getTransitMode(prevStop, stop) : null;
              const dist = prevStop ? getDistanceKm(prevStop, stop) : null;

              return (
                <li key={stop.id}>
                  {/* Transit connector */}
                  {mode && prevStop && (
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-via-grey-light bg-via-off-white">
                      <div className="w-px h-4 bg-via-grey-light mx-3" />
                      {mode === "flight" && <Plane size={11} strokeWidth={1.5} className="text-via-grey-mid" />}
                      {mode === "train" && <Train size={11} strokeWidth={1.5} className="text-via-grey-mid" />}
                      {mode === "drive" && <Car size={11} strokeWidth={1.5} className="text-via-grey-mid" />}
                      <span className="font-mono text-[10px] text-via-grey-mid uppercase tracking-wide">
                        {mode} · {dist} km
                      </span>
                    </div>
                  )}

                  {/* Stop card */}
                  <div
                    ref={(el) => { stopRefs.current[idx] = el; }}
                    className={`border-b border-via-grey-light transition-colors cursor-pointer ${isActive ? "bg-via-off-white border-l-2 border-l-via-red" : "hover:bg-via-off-white border-l-2 border-l-transparent"}`}
                    onClick={() => {
                      flyToStop(idx);
                      setExpandedStops((prev) => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx);
                        else next.add(idx);
                        return next;
                      });
                    }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Number badge */}
                      <div
                        className={`w-7 h-7 flex items-center justify-center font-mono text-xs font-bold shrink-0 ${isActive ? "bg-via-red text-via-white" : "bg-via-black text-via-white"}`}
                      >
                        {idx + 1}
                      </div>

                      {/* City info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-grotesk font-semibold text-sm text-via-black leading-tight truncate">
                          {stop.city.name}
                        </p>
                        <p className="font-mono text-[10px] text-via-grey-mid mt-0.5 truncate">
                          {formatDateRange(stop.startDate, stop.endDate)} · {nights} night{nights !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Thumbnail + expand */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={stop.city.imageUrl || getCityImageUrl(stop.city.name, stop.city.country)}
                            alt={stop.city.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isExpanded
                          ? <ChevronUp size={14} strokeWidth={1.5} className="text-via-grey-mid" />
                          : <ChevronDown size={14} strokeWidth={1.5} className="text-via-grey-mid" />
                        }
                      </div>
                    </div>

                    {/* Expanded: activities list */}
                    {isExpanded && stop.activities.length > 0 && (
                      <div className="px-4 pb-3 space-y-1.5 border-t border-via-grey-light pt-2">
                        {stop.activities.map((sa) => (
                          <div key={sa.id} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-via-grey-mid mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[11px] text-via-black leading-snug">{sa.activity.name}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="font-mono text-[10px] text-via-grey-mid flex items-center gap-0.5">
                                  <Clock size={8} /> {sa.activity.durationHours}h
                                </span>
                                <span className="font-mono text-[10px] text-via-grey-mid flex items-center gap-0.5">
                                  <Star size={8} /> {sa.activity.rating.toFixed(1)}
                                </span>
                                <span className="font-mono text-[10px] text-via-grey-mid ml-auto">
                                  {formatCurrency(sa.activity.estimatedCost)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {totalCost > 0 && (
                          <div className="pt-1.5 border-t border-via-grey-light mt-1.5 flex justify-between">
                            <span className="font-mono text-[10px] text-via-grey-mid uppercase tracking-wide">Est. activities cost</span>
                            <span className="font-mono text-[11px] font-bold text-via-black">{formatCurrency(totalCost)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isExpanded && stop.activities.length === 0 && (
                      <p className="px-4 pb-3 font-mono text-[10px] text-via-grey-light border-t border-via-grey-light pt-2">
                        No activities added yet
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
