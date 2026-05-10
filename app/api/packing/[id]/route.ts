import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.packingItem.findFirst({
    where: { id, trip: { userId: session.user.id } },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.packingItem.update({
    where: { id },
    data: {
      ...(typeof body.isPacked === "boolean" && { isPacked: body.isPacked }),
      ...(body.name && { name: body.name }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.packingItem.findFirst({
    where: { id, trip: { userId: session.user.id } },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  await prisma.packingItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
