import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripsListClient } from "@/components/trip/TripsListClient";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { TripCard } from "@/types";

export const metadata = { title: "My Trips — VIA" };

export default async function TripsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
  };

  // Fetch all trips for this user with stops + city data
  const rawTrips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
      },
      _count: { select: { stops: true, expenses: true } },
    },
  });

  // Serialize Dates to ISO strings for client component
  const trips: TripCard[] = rawTrips.map((t) => ({
    ...t,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    status: t.status as TripCard["status"],
    stops: t.stops.map((s) => ({
      ...s,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      activities: s.activities.map((a) => ({
        ...a,
        scheduledDate: a.scheduledDate ? a.scheduledDate.toISOString() : null,
        activity: {
          ...a.activity,
          category: a.activity.category as never,
        },
      })),
    })),
  }));

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6">
        <PageHeader
          title="My Trips"
          subtitle={
            trips.length > 0
              ? `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`
              : undefined
          }
          breadcrumb={[{ label: "Trips" }]}
          actions={
            <Link href="/trips/new">
              <Button variant="primary" size="md">
                + New Trip
              </Button>
            </Link>
          }
        />
        <TripsListClient trips={trips} />
      </div>
    </AppShell>
  );
}
