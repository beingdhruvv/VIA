import type { City } from "@prisma/client";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(a: Pick<City, "latitude" | "longitude">, b: Pick<City, "latitude" | "longitude">) {
  if ((a.latitude === 0 && a.longitude === 0) || (b.latitude === 0 && b.longitude === 0)) return null;
  const earth = 6371;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function estimateTravelCosts(destination: City, origin?: City | null) {
  const originCity = origin ?? { name: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090 };
  const km = distanceKm(originCity, destination);
  const roadKm = km ? Math.round(km * 1.22) : null;
  const multiplier = destination.country === "India" ? 1 : 3.5;
  const busLow = roadKm ? Math.max(500, Math.round(roadKm * 2.2 * multiplier)) : 900;
  const busHigh = roadKm ? Math.max(busLow + 400, Math.round(roadKm * 4.5 * multiplier)) : 1800;
  const trainLow = km ? Math.max(300, Math.round(km * 1.1 * multiplier)) : 500;
  const trainHigh = km ? Math.max(trainLow + 500, Math.round(km * 3.0 * multiplier)) : 2500;
  const flightLow = km ? Math.max(2500, Math.round(km * 5.0 * multiplier)) : 4500;
  const flightHigh = km ? Math.max(flightLow + 2000, Math.round(km * 11 * multiplier)) : 12000;

  return {
    originLabel: `${originCity.name}, ${originCity.country}`,
    distanceLabel: roadKm ? `~${roadKm.toLocaleString("en-IN")} km road distance` : "Distance unknown",
    modes: [
      { mode: "Bus / cab", estimate: `${INR.format(busLow)}-${INR.format(busHigh)}`, note: "Road estimate including hill premium where relevant." },
      { mode: "Train + road", estimate: `${INR.format(trainLow)}-${INR.format(trainHigh)}`, note: "Works when destination has no direct railhead." },
      { mode: "Flight + transfer", estimate: `${INR.format(flightLow)}-${INR.format(flightHigh)}`, note: "Indicative fare band; live fares vary by date." },
    ],
  };
}
