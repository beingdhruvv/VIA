import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MemoriesClient } from "./_MemoriesClient";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [memories, trips, user] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Memories" 
        subtitle="Your travel history, captured in moments."
      />
      <MemoriesClient 
        initialMemories={memories as any} 
        trips={trips}
        storageUsed={user?.storageUsed || 0}
      />
    </div>
  );
}
