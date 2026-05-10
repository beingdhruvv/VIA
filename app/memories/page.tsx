import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MemoriesClient } from "./_MemoriesClient";
import { PageHeader } from "@/components/layout/PageHeader";
import type { MemoryData } from "@/types";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [memoriesResult, trips, user] = await Promise.all([
    prisma.memory.findMany({
      where: { userId: session.user.id },
      include: { trip: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.trip.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true }
    })
  ]);

  const memories: MemoryData[] = memoriesResult.map(m => ({
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
    trip: m.trip
  }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Memories" 
        subtitle="Your travel history, captured in moments."
      />
      <MemoriesClient 
        initialMemories={memories} 
        trips={trips}
        storageUsed={user?.storageUsed || 0}
      />
    </div>
  );
}
