import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripSubNav } from "@/components/trip/TripSubNav";
import { PackingClient } from "./_PackingClient";
import type { PackingItemData } from "@/types";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id }, select: { name: true } });
  return { title: `Packing — ${trip?.name ?? "Trip"} — VIA` };
}

export default async function PackingPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: { packingItems: { orderBy: { createdAt: "asc" } } },
  });
  if (!trip) redirect("/trips");

  const user = { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", image: session.user.image };

  const items: PackingItemData[] = trip.packingItems.map((i) => ({
    ...i,
    category: i.category as PackingItemData["category"],
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6">
        <TripSubNav tripId={id} />
        <PackingClient tripId={id} initialItems={items} />
      </div>
    </AppShell>
  );
}
