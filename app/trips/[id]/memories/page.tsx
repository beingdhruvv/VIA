import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MemoriesClient } from "@/app/memories/_MemoriesClient";
import { AppShell } from "@/components/layout/AppShell";
import { TripSubNav } from "@/components/trip/TripSubNav";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripMemoriesPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const [trip, memories, user] = await Promise.all([
    prisma.trip.findFirst({
      where: { 
        id, 
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } }
        ]
      },
      select: { id: true, name: true }
    }),
    prisma.memory.findMany({
      where: { tripId: id },
      include: { trip: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true }
    })
  ]);

  if (!trip) redirect("/trips");

  const sidebarUser = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <AppShell user={sidebarUser} showBack>
      <div className="bg-via-white sticky top-14 md:top-0 z-20 border-b border-via-black">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold font-grotesk italic uppercase tracking-tight">{trip.name} · Memories</h1>
          <p className="text-xs font-mono text-via-grey-mid mt-1 uppercase">Captured moments from this journey.</p>
        </div>
        <div className="max-w-3xl mx-auto px-4">
          <TripSubNav tripId={id} />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <MemoriesClient 
          initialMemories={memories as any} 
          trips={[trip]}
          storageUsed={user?.storageUsed || 0}
        />
      </main>
    </AppShell>
  );
}
