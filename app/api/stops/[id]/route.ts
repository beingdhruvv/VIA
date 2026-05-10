import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStopSchema = z.object({
  orderIndex: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional().nullable(),
});

async function getStopWithTripOwner(stopId: string, userId: string) {
  return prisma.tripStop.findFirst({
    where: { id: stopId, trip: { userId } },
    include: { trip: true },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const stop = await getStopWithTripOwner(id, session.user.id);
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateStopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.tripStop.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
      ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
    },
    include: { city: true, activities: { include: { activity: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const stop = await getStopWithTripOwner(id, session.user.id);
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 });

  await prisma.tripStop.delete({ where: { id } });

  // Reorder remaining stops
  const remaining = await prisma.tripStop.findMany({
    where: { tripId: stop.tripId },
    orderBy: { orderIndex: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    await prisma.tripStop.update({ where: { id: remaining[i].id }, data: { orderIndex: i } });
  }

  return NextResponse.json({ success: true });
}
