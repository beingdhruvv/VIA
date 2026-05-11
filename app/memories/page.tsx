import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MemoriesClient } from "./_MemoriesClient";
import { PageHeader } from "@/components/layout/PageHeader";
import type { MemoryData } from "@/types";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [memoriesResult, trips, currentUser] = await Promise.all([
    prisma.memory.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { shares: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        trip: { select: { name: true } },
        shares: {
          select: {
            user: { select: { id: true, name: true, email: true } },
            sharedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.trip.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageLimit: true },
    }),
  ]);

  const mappedMemories: MemoryData[] = memoriesResult.map(m => ({
    id: m.id,
    userId: m.userId,
    tripId: m.tripId,
    imageUrl: m.imageUrl,
    thumbnailUrl: m.thumbnailUrl,
    caption: m.caption,
    fileName: m.fileName,
    fileSize: m.fileSize,
    mimeType: m.mimeType,
    takenAt: m.takenAt?.toISOString() ?? null,
    latitude: m.latitude,
    longitude: m.longitude,
    locationName: m.locationName,
    createdAt: m.createdAt.toISOString(),
    trip: m.trip,
    sharedWith: m.shares.map((share) => share.user),
    sharedBy: m.userId === session.user.id ? null : m.shares.find((share) => share.user.id === session.user.id)?.sharedBy ?? null,
    canDelete: m.userId === session.user.id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Memories" 
        subtitle="Your travel history, captured in moments."
      />
      <MemoriesClient 
        initialMemories={mappedMemories} 
        trips={trips}
        storageLimit={currentUser?.storageLimit ?? undefined}
      />
    </div>
  );
}
