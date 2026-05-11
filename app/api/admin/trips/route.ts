import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: { user?: { role?: string | null } } | null) {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trips = await prisma.trip.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { stops: true, expenses: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(trips);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    const trip = await prisma.trip.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        coverUrl: body.coverUrl,
        totalBudget: body.totalBudget,
        status: body.status,
        isPublic: body.isPublic,
        shareMemories: body.shareMemories,
      },
    });
    return NextResponse.json(trip);
  } catch {
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Trip id is required" }, { status: 400 });
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
