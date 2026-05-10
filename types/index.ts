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
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
}

// ─── Enum string literals ─────────────────────────────────────────────────────

export type TripStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
export type ActivityCategory = "SIGHTSEEING" | "FOOD" | "ADVENTURE" | "CULTURE" | "SHOPPING" | "WELLNESS";
export type ExpenseCategory = "TRANSPORT" | "STAY" | "FOOD" | "ACTIVITIES" | "MISC";
export type PackingCategory = "CLOTHING" | "DOCUMENTS" | "ELECTRONICS" | "TOILETRIES" | "MISC";

// ─── Domain types ─────────────────────────────────────────────────────────────

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

export interface ExpenseSplitData {
  userId: string;
  amount: number;
  user?: { name: string };
}

export interface ExpenseData {
  id: string;
  tripId: string;
  stopId: string | null;
  payerId?: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  payer?: { id: string; name: string; avatarUrl: string | null };
  splits?: ExpenseSplitData[];
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

export interface TripCollaboratorData {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface MemoryData {
  id: string;
  userId: string;
  tripId: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  createdAt: string;
  trip?: { name: string } | null;
}

export interface TripFull extends TripCard {
  expenses: ExpenseData[];
  packingItems: PackingItemData[];
  notes: NoteData[];
  sharedLinks: { id: string; slug: string; views: number }[];
  collaborators?: TripCollaboratorData[];
  memories?: MemoryData[];
}
