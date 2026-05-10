import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.tripNote.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  const body = await req.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const updated = await prisma.tripNote.update({
    where: { id },
    data: { content: body.content },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.tripNote.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  await prisma.tripNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
