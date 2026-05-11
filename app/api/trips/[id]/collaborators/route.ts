import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  try {
    const collaborators = await prisma.tripCollaborator.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
    });

    return NextResponse.json(collaborators);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  try {
    const { email, role = "EDITOR" } = await req.json();

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found. They must have a VIA account." }, { status: 404 });
    }

    const collab = await prisma.tripCollaborator.create({
      data: {
        tripId,
        userId: targetUser.id,
        role,
      },
      include: { user: true }
    });

    return NextResponse.json(collab);
  } catch {
    return NextResponse.json({ error: "Already a collaborator or server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const { searchParams } = new URL(req.url);
  const collaboratorId = searchParams.get("collaboratorId");

  if (!collaboratorId) {
    return NextResponse.json({ error: "Missing collaboratorId" }, { status: 400 });
  }

  try {
    // Only owner can remove people
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true }
    });

    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the trip owner can remove members" }, { status: 403 });
    }

    await prisma.tripCollaborator.delete({
      where: { id: collaboratorId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
