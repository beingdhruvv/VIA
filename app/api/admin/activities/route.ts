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
    const activities = await prisma.activity.findMany({
      include: { city: { select: { name: true, country: true } } },
      orderBy: { name: "asc" },
      take: 300,
    });
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const activity = await prisma.activity.create({
      data: {
        cityId: body.cityId,
        name: body.name,
        description: body.description,
        category: body.category,
        estimatedCost: Number(body.estimatedCost ?? 0),
        durationHours: Number(body.durationHours ?? 1),
        imageUrl: body.imageUrl || null,
        rating: Number(body.rating ?? 4),
      },
    });
    return NextResponse.json(activity);
  } catch {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Activity id is required" }, { status: 400 });
    const activity = await prisma.activity.update({
      where: { id: body.id },
      data: {
        cityId: body.cityId,
        name: body.name,
        description: body.description,
        category: body.category,
        estimatedCost: body.estimatedCost,
        durationHours: body.durationHours,
        imageUrl: body.imageUrl,
        rating: body.rating,
      },
    });
    return NextResponse.json(activity);
  } catch {
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "Activity id is required" }, { status: 400 });
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
