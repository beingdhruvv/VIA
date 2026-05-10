import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { TripSubNav } from "@/components/trip/TripSubNav";
import { CollaboratorsList } from "@/components/trip/CollaboratorsList";
import { formatDateRange } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";

interface MembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const trip = await prisma.trip.findFirst({
    where: { 
      id, 
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    },
    select: { name: true, startDate: true, endDate: true, status: true }
  });

  if (!trip) redirect("/trips");

  const user = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
    role: session.user.role,
  };

  return (
    <AppShell user={user} showBack>
      <header className="sticky top-14 md:top-0 z-20 bg-via-white border-b border-via-black">
        <div className="px-4 md:px-8 py-4">
          <h1 className="text-[22px] md:text-[28px] font-bold text-via-black font-space-grotesk">{trip.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="font-mono text-xs text-via-grey-mid">{formatDateRange(trip.startDate, trip.endDate)}</p>
            <StatusBadge status={trip.status as any} />
          </div>
        </div>
        <div className="px-4 md:px-8">
          <TripSubNav tripId={id} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-via-white border-2 border-via-black p-6 shadow-brutalist">
          <CollaboratorsList tripId={id} />
        </div>
      </div>
    </AppShell>
  );
}
