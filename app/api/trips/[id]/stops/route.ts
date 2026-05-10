import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addStopSchema = z.object({
  cityId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const stops = await prisma.tripStop.findMany({
    where: { tripId: id },
    orderBy: { orderIndex: "asc" },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
  });

  return NextResponse.json(stops);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await req.json();
  const parsed = addStopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { cityId, startDate, endDate, notes } = parsed.data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start < trip.startDate || end > trip.endDate) {
    return NextResponse.json(
      { error: "Stop dates must fall within trip dates" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.tripStop.aggregate({
    where: { tripId },
    _max: { orderIndex: true },
  });

  const stop = await prisma.tripStop.create({
    data: {
      tripId,
      cityId,
      startDate: start,
      endDate: end,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
      notes,
    },
    include: { city: true, activities: { include: { activity: true } } },
  });

  return NextResponse.json(stop, { status: 201 });
}
