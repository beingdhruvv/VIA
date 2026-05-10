import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addActivitySchema = z.object({
  activityId: z.string().uuid(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const stop = await prisma.tripStop.findFirst({
    where: { id, trip: { userId: session.user.id } },
  });
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 });

  const activities = await prisma.stopActivity.findMany({
    where: { stopId: id },
    include: { activity: true },
  });

  return NextResponse.json(activities);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stopId } = await params;
  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, trip: { userId: session.user.id } },
  });
  if (!stop) return NextResponse.json({ error: "Stop not found" }, { status: 404 });

  const body = await req.json();
  const parsed = addActivitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { activityId, scheduledDate, scheduledTime } = parsed.data;

  const existing = await prisma.stopActivity.findFirst({ where: { stopId, activityId } });
  if (existing) {
    await prisma.stopActivity.delete({ where: { id: existing.id } });
    return NextResponse.json({ removed: true });
  }

  const sa = await prisma.stopActivity.create({
    data: {
      stopId,
      activityId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime: scheduledTime ?? null,
    },
    include: { activity: true },
  });

  return NextResponse.json(sa, { status: 201 });
}
