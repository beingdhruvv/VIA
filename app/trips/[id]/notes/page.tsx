import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripSubNav } from "@/components/trip/TripSubNav";
import { NotesClient } from "./_NotesClient";
import type { NoteData } from "@/types";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id }, select: { name: true } });
  return { title: `Notes — ${trip?.name ?? "Trip"} — VIA` };
}

export default async function NotesPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        include: { stop: { include: { city: true } } },
      },
      stops: { orderBy: { orderIndex: "asc" }, include: { city: true } },
    },
  });
  if (!trip) redirect("/trips");

  const user = { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", image: session.user.image };

  const notes: NoteData[] = trip.notes.map((n) => ({
    id: n.id,
    tripId: n.tripId,
    stopId: n.stopId,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
    stop: n.stop ? { city: { ...n.stop.city, imageUrl: n.stop.city.imageUrl } } : null,
  }));

  const stops = trip.stops.map((s) => ({ id: s.id, cityName: s.city.name }));

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6">
        <TripSubNav tripId={id} />
        <NotesClient tripId={id} initialNotes={notes} stops={stops} />
      </div>
    </AppShell>
  );
}
