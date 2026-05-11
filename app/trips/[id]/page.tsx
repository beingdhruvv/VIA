import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripItineraryClient } from "@/components/trip/TripItineraryClient";
import { JsonLd } from "@/components/seo/JsonLd";
import type { TripFull } from "@/types";

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const user = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  const trip = await prisma.trip.findFirst({
    where: { 
      id, 
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
      },
      stops: {
        orderBy: { orderIndex: "asc" },
        include: {
          city: true,
          activities: {
            include: { activity: true },
            orderBy: { scheduledTime: "asc" },
          },
        },
      },
      expenses: { 
        orderBy: { date: "desc" },
        include: { payer: true, splits: { include: { user: true } } }
      },
      packingItems: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      sharedLinks: true,
      memories: { orderBy: { createdAt: "desc" } },
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
    expenses: (trip.expenses || []).map((e: Record<string, unknown> & { id: string, tripId: string, stopId: string | null, payerId: string | null, category: string, amount: number, description: string, date: Date, payer: { id: string, name: string, avatarUrl: string | null } | null, splits: Array<{ userId: string, amount: number, user: { name: string } }> }) => ({
      id: e.id,
      tripId: e.tripId,
      stopId: e.stopId,
      payerId: e.payerId,
      category: e.category as TripFull["expenses"][0]["category"],
      amount: e.amount,
      description: e.description,
      date: e.date.toISOString(),
      payer: e.payer ? {
        id: e.payer.id,
        name: e.payer.name,
        avatarUrl: e.payer.avatarUrl
      } : undefined,
      splits: (e.splits || []).map((s: { userId: string, amount: number, user: { name: string } }) => ({
        userId: s.userId,
        amount: s.amount,
        user: { name: s.user.name }
      }))
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
    collaborators: (trip.collaborators || []).map((c: Record<string, unknown> & { id: string, userId: string, role: string, user: { id: string, name: string, email: string, avatarUrl: string | null } }) => ({
      id: c.id,
      userId: c.userId,
      role: c.role,
      user: {
        id: c.user.id,
        name: c.user.name,
        email: c.user.email,
        avatarUrl: c.user.avatarUrl
      }
    })),
    memories: (trip.memories || []).map((m: Record<string, unknown> & { id: string, userId: string, tripId: string | null, imageUrl: string, thumbnailUrl: string | null, caption: string | null, fileName: string | null, fileSize: number | null, mimeType: string | null, takenAt: Date | null, latitude: number | null, longitude: number | null, locationName: string | null, createdAt: Date }) => ({
      id: m.id,
      userId: m.userId,
      tripId: m.tripId,
      imageUrl: m.imageUrl,
      thumbnailUrl: m.thumbnailUrl,
      caption: m.caption,
      fileName: m.fileName ?? "memory",
      fileSize: m.fileSize ?? 0,
      mimeType: m.mimeType ?? "image/*",
      takenAt: m.takenAt?.toISOString() ?? null,
      latitude: m.latitude,
      longitude: m.longitude,
      locationName: m.locationName,
      createdAt: m.createdAt.toISOString()
    }))
  };


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Trip",
    "name": trip.name,
    "description": trip.description,
    "startDate": trip.startDate.toISOString(),
    "endDate": trip.endDate.toISOString(),
    "itinerary": (trip.stops || []).map((s: { city: { name: string } }) => ({
      "@context": "https://schema.org",
      "@type": "City",
      "name": s.city.name
    }))
  };

  return (
    <AppShell user={user} showBack>
      <JsonLd data={jsonLd} />
      <TripItineraryClient trip={serialized} />
    </AppShell>
  );

}
