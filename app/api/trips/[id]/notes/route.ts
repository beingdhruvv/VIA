import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  stopId: z.string().uuid().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const notes = await prisma.tripNote.findMany({
    where: { tripId: id },
    orderBy: { createdAt: "desc" },
    include: { stop: { include: { city: true } } },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await req.json();
  const parsed = addNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const note = await prisma.tripNote.create({
    data: {
      tripId,
      userId: session.user.id,
      content: parsed.data.content,
      stopId: parsed.data.stopId ?? null,
    },
    include: { stop: { include: { city: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
