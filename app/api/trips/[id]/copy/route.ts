import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sourceId } = await params;

  const source = await prisma.trip.findFirst({
    where: { id: sourceId, isPublic: true },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: { activities: { include: { activity: true } } },
      },
    },
  });

  if (!source) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const copy = await prisma.trip.create({
    data: {
      userId: session.user.id,
      name: `${source.name} (copy)`,
      description: source.description,
      startDate: source.startDate,
      endDate: source.endDate,
      totalBudget: source.totalBudget,
      status: "PLANNING",
      stops: {
        create: source.stops.map((stop) => ({
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          startDate: stop.startDate,
          endDate: stop.endDate,
          notes: stop.notes,
          activities: {
            create: stop.activities.map((sa) => ({
              activityId: sa.activityId,
              scheduledDate: sa.scheduledDate,
              scheduledTime: sa.scheduledTime,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ id: copy.id }, { status: 201 });
}
