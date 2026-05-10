import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["CLOTHING", "DOCUMENTS", "ELECTRONICS", "TOILETRIES", "MISC"]),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const items = await prisma.packingItem.findMany({
    where: { tripId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const body = await req.json();

  // Support bulk insert (template)
  if (Array.isArray(body)) {
    const items = await prisma.packingItem.createMany({
      data: body.map((item) => ({ ...item, tripId })),
    });
    return NextResponse.json(items, { status: 201 });
  }

  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const item = await prisma.packingItem.create({
    data: { tripId, ...parsed.data },
  });

  return NextResponse.json(item, { status: 201 });
}
