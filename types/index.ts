/**
 * VIA — Shared TypeScript types
 * Enums are stored as strings in SQLite; validated via Zod on input
 */

// ─── Session user (mirrors next-auth Session.user shape) ─────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// ─── Enum string literals ─────────────────────────────────────────────────────

export type TripStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
export type ActivityCategory = "SIGHTSEEING" | "FOOD" | "ADVENTURE" | "CULTURE" | "SHOPPING" | "WELLNESS";
export type ExpenseCategory = "TRANSPORT" | "STAY" | "FOOD" | "ACTIVITIES" | "MISC";
export type PackingCategory = "CLOTHING" | "DOCUMENTS" | "ELECTRONICS" | "TOILETRIES" | "MISC";

// ─── Domain types ─────────────────────────────────────────────────────────────

/** Minimal user shape stored in the NextAuth JWT session */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  createdAt: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularityScore: number;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
}

export interface ActivityData {
  id: string;
  cityId: string;
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  durationHours: number;
  imageUrl: string | null;
  rating: number;
}

export interface StopActivityWithActivity {
  id: string;
  stopId: string;
  activityId: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  actualCost: number | null;
  activity: ActivityData;
}

export interface StopWithCity {
  id: string;
  tripId: string;
  cityId: string;
  orderIndex: number;
  startDate: string;
  endDate: string;
  notes: string | null;
  city: CityData;
  activities: StopActivityWithActivity[];
}

export interface ExpenseData {
  id: string;
  tripId: string;
  stopId: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
}

export interface PackingItemData {
  id: string;
  tripId: string;
  name: string;
  category: PackingCategory;
  isPacked: boolean;
  createdAt: string;
}

export interface NoteData {
  id: string;
  tripId: string;
  stopId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  stop?: { city: CityData } | null;
}

export interface TripCard {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  totalBudget: number | null;
  isPublic: boolean;
  publicSlug: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  stops: StopWithCity[];
  _count?: { stops: number; expenses: number };
}

export interface TripFull extends TripCard {
  expenses: ExpenseData[];
  packingItems: PackingItemData[];
  notes: NoteData[];
  sharedLinks: { id: string; slug: string; views: number }[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}
