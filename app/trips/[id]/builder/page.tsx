import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ItineraryBuilderClient } from "@/components/trip/ItineraryBuilderClient";
import type { TripFull } from "@/types";

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
      },
      expenses: { orderBy: { date: "desc" } },
      packingItems: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      sharedLinks: true,
    },
  });

  if (!trip) redirect("/trips");

  // Type-safe serialization
  const serialized: TripFull = {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    coverUrl: trip.coverUrl,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    totalBudget: trip.totalBudget,
    isPublic: trip.isPublic,
    publicSlug: trip.publicSlug,
    shareMemories: trip.shareMemories,
    status: trip.status as TripFull["status"],
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    stops: (trip.stops || []).map((s: Record<string, unknown> & { id: string, tripId: string, cityId: string, orderIndex: number, startDate: Date, endDate: Date, notes: string | null, city: { id: string, name: string, country: string, region: string | null, costIndex: number | null, popularityScore: number | null, imageUrl: string | null, latitude: number | null, longitude: number | null }, activities: Array<{ id: string, stopId: string, activityId: string, scheduledDate: Date | null, scheduledTime: string | null, actualCost: number | null, activity: { id: string, cityId: string, name: string, description: string | null, category: string, estimatedCost: number | null, durationHours: number | null, imageUrl: string | null, rating: number | null } }> }) => ({
      id: s.id,
      tripId: s.tripId,
      cityId: s.cityId,
      orderIndex: s.orderIndex,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      notes: s.notes,
      city: {
        id: s.city.id,
        name: s.city.name,
        country: s.city.country,
        region: s.city.region ?? "",
        costIndex: s.city.costIndex ?? 0,
        popularityScore: s.city.popularityScore ?? 0,
        imageUrl: s.city.imageUrl,
        latitude: s.city.latitude ?? 0,
        longitude: s.city.longitude ?? 0,
      },
      activities: (s.activities || []).map((a: Record<string, unknown> & { id: string, stopId: string, activityId: string, scheduledDate: Date | null, scheduledTime: string | null, actualCost: number | null, activity: { id: string, cityId: string, name: string, description: string | null, category: string, estimatedCost: number | null, durationHours: number | null, imageUrl: string | null, rating: number | null } }) => ({
        id: a.id,
        stopId: a.stopId,
        activityId: a.activityId,
        scheduledDate: a.scheduledDate?.toISOString() ?? null,
        scheduledTime: a.scheduledTime,
        actualCost: a.actualCost,
        activity: {
          id: a.activity.id,
          cityId: a.activity.cityId,
          name: a.activity.name,
          description: a.activity.description ?? "",
          category: a.activity.category as TripFull["stops"][0]["activities"][0]["activity"]["category"],
          estimatedCost: a.activity.estimatedCost ?? 0,
          durationHours: a.activity.durationHours ?? 0,
          imageUrl: a.activity.imageUrl,
          rating: a.activity.rating ?? 0,
        },
      })),
    })),
    expenses: (trip.expenses || []).map((e: Record<string, unknown> & { id: string, tripId: string, stopId: string | null, category: string, amount: number, description: string, date: Date }) => ({
      id: e.id,
      tripId: e.tripId,
      stopId: e.stopId,
      category: e.category as TripFull["expenses"][0]["category"],
      amount: e.amount,
      description: e.description,
      date: e.date.toISOString(),
    })),
    packingItems: (trip.packingItems || []).map((p: Record<string, unknown> & { id: string, tripId: string, name: string, category: string, isPacked: boolean, createdAt: Date }) => ({
      id: p.id,
      tripId: p.tripId,
      name: p.name,
      category: p.category as TripFull["packingItems"][0]["category"],
      isPacked: p.isPacked,
      createdAt: p.createdAt.toISOString(),
    })),
    notes: (trip.notes || []).map((n: Record<string, unknown> & { id: string, tripId: string, stopId: string | null, content: string, createdAt: Date, updatedAt: Date }) => ({
      id: n.id,
      tripId: n.tripId,
      stopId: n.stopId,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    sharedLinks: (trip.sharedLinks || []).map((l: Record<string, unknown> & { id: string, slug: string, views: number }) => ({
      id: l.id,
      slug: l.slug,
      views: l.views,
    })),
  };

  const user = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <AppShell user={user} showBack>
      <ItineraryBuilderClient trip={serialized} />
    </AppShell>
  );
}
