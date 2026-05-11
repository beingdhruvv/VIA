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
    // @ts-ignore
    shareMemories: trip.shareMemories,
    status: trip.status as TripFull["status"],
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    // @ts-ignore
    stops: (trip.stops || []).map((s: any) => ({
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
        region: s.city.region,
        costIndex: s.city.costIndex,
        popularityScore: s.city.popularityScore,
        imageUrl: s.city.imageUrl,
        latitude: s.city.latitude,
        longitude: s.city.longitude,
      },
      activities: (s.activities || []).map((a: any) => ({
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
          description: a.activity.description,
          category: a.activity.category as TripFull["stops"][0]["activities"][0]["activity"]["category"],
          estimatedCost: a.activity.estimatedCost,
          durationHours: a.activity.durationHours,
          imageUrl: a.activity.imageUrl,
          rating: a.activity.rating,
        },
      })),
    })),
    // @ts-ignore
    expenses: (trip.expenses || []).map((e: any) => ({
      id: e.id,
      tripId: e.tripId,
      stopId: e.stopId,
      category: e.category as TripFull["expenses"][0]["category"],
      amount: e.amount,
      description: e.description,
      date: e.date.toISOString(),
    })),
    // @ts-ignore
    packingItems: (trip.packingItems || []).map((p: any) => ({
      id: p.id,
      tripId: p.tripId,
      name: p.name,
      category: p.category as TripFull["packingItems"][0]["category"],
      isPacked: p.isPacked,
      createdAt: p.createdAt.toISOString(),
    })),
    // @ts-ignore
    notes: (trip.notes || []).map((n: any) => ({
      id: n.id,
      tripId: n.tripId,
      stopId: n.stopId,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
    // @ts-ignore
    sharedLinks: (trip.sharedLinks || []).map((l: any) => ({
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
