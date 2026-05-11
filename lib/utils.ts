import { type ClassValue, clsx } from "clsx";
import { CITY_IMAGES, FALLBACK_CITY_IMAGE, getActivityImageUrl as getCuratedActivityImageUrl } from "@/lib/place-images";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${s.toLocaleDateString("en-IN", opts).toUpperCase()} — ${e.toLocaleDateString("en-IN", { ...opts, year: "numeric" }).toUpperCase()}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function diffInDays(start: Date | string, end: Date | string): number {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Wikimedia Commons hero for seeded cities; optional country disambiguates duplicate names. */
export function getCityImageUrl(cityName: string, country?: string | null): string {
  if (!cityName.trim()) return FALLBACK_CITY_IMAGE;
  if (country) {
    const key = `${cityName}|${country}`;
    if (CITY_IMAGES[key]) return CITY_IMAGES[key];
  }
  const hit = Object.entries(CITY_IMAGES).find(([key]) => key.startsWith(`${cityName}|`));
  if (hit) return hit[1];
  return FALLBACK_CITY_IMAGE;
}

/**
 * Activity cards: use the parent city image (real place) until a per-activity URL exists in DB.
 */
export function getActivityImageUrl(
  activityName: string,
  cityName?: string | null,
  country?: string | null,
  category?: string | null,
): string {
  return getCuratedActivityImageUrl(activityName, cityName, country, category);
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}
