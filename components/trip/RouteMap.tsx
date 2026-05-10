"use client";

import { useEffect, useRef } from "react";
import type { StopWithCity } from "@/types";

interface RouteMapProps {
  stops: StopWithCity[];
  className?: string;
}

export function RouteMap({ stops, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;
    if (instanceRef.current) return; // already initialized

    const validStops = stops.filter(
      (s) => s.city.latitude != null && s.city.longitude != null
    );
    if (validStops.length === 0) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView(
        [validStops[0].city.latitude, validStops[0].city.longitude],
        5
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const points: [number, number][] = [];

      validStops.forEach((stop, i) => {
        const lat = stop.city.latitude;
        const lng = stop.city.longitude;
        points.push([lat, lng]);

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(
          `<div style="font-family:monospace;font-size:12px">
            <strong>${i + 1}. ${stop.city.name}</strong><br/>
            ${stop.city.country}
          </div>`
        );

        // Numbered icon
        const icon = L.divIcon({
          html: `<div style="background:#111111;color:#fff;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:11px;font-weight:bold">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: "",
        });
        marker.setIcon(icon);
      });

      if (points.length > 1) {
        L.polyline(points, { color: "#1B2A41", weight: 2, dashArray: "6,4" }).addTo(map);
        map.fitBounds(points, { padding: [32, 32] });
      }

      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) {
        (instanceRef.current as { remove: () => void }).remove();
        instanceRef.current = null;
      }
    };
  }, [stops]);

  if (stops.length === 0) return null;

  return (
    <div
      ref={mapRef}
      className={`border border-via-black ${className}`}
      style={{ height: 320 }}
    />
  );
}
