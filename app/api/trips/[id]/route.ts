import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check ownership
    const trip = await prisma.trip.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.userId !== session.user.id) {
      // Check if collaborator with EDITOR/OWNER role
      const collaborator = await prisma.tripCollaborator.findUnique({
        where: {
          tripId_userId: {
            tripId: id,
            userId: session.user.id
          }
        }
      });

      if (!collaborator || collaborator.role === "VIEWER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Delete trip (cascade will handle stops, etc.)
    await prisma.trip.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Trip Error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const { name, description, startDate, endDate, totalBudget, isPublic, status, shareMemories } = body;

    // Check ownership/collaboration
    const trip = await prisma.trip.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (trip.userId !== session.user.id) {
      const collab = await prisma.tripCollaborator.findUnique({
        where: { tripId_userId: { tripId: id, userId: session.user.id } }
      });
      if (!collab || collab.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalBudget,
        isPublic,
        status,
        shareMemories
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Trip Error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}
