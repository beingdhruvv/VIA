import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditTripForm } from "@/components/forms/EditTripForm";
import type { TripCard } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id }, select: { name: true } });
  return { title: trip ? `Edit ${trip.name} — VIA` : "Edit Trip — VIA" };
}

export default async function EditTripPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const raw = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
      },
      _count: { select: { stops: true, expenses: true } },
    },
  });

  if (!raw) notFound();

  const trip: TripCard = {
    ...raw,
    startDate: raw.startDate.toISOString(),
    endDate: raw.endDate.toISOString(),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    status: raw.status as TripCard["status"],
    stops: raw.stops.map((s) => ({
      ...s,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      activities: s.activities.map((a) => ({
        ...a,
        scheduledDate: a.scheduledDate ? a.scheduledDate.toISOString() : null,
        activity: {
          ...a.activity,
          category: a.activity.category as never,
        },
      })),
    })),
  };

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <AppShell user={user} showBack>
      <div className="px-4 md:px-8 py-6 max-w-2xl">
        <PageHeader
          title="Edit Trip"
          subtitle={trip.name}
          breadcrumb={[
            { label: "Trips", href: "/trips" },
            { label: trip.name, href: `/trips/${trip.id}` },
            { label: "Edit" },
          ]}
        />
        <EditTripForm trip={trip} />
      </div>
    </AppShell>
  );
}
