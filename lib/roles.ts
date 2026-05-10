import type { SessionUser, TripStatus } from "@/types";

type SessionUserRole = NonNullable<SessionUser["role"]>;

const SESSION_USER_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const satisfies readonly SessionUserRole[];
const TRIP_STATUSES = ["PLANNING", "ACTIVE", "COMPLETED"] as const satisfies readonly TripStatus[];

export function toSessionUserRole(role: string | null | undefined): SessionUserRole {
  return SESSION_USER_ROLES.find((value) => value === role) ?? "USER";
}

export function toTripStatus(status: string | null | undefined): TripStatus {
  return TRIP_STATUSES.find((value) => value === status) ?? "PLANNING";
}
