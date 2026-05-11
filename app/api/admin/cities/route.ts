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
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      take: 200,
    });
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const city = await prisma.city.create({
      data: {
        name: body.name,
        country: body.country,
        region: body.region,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        popularityScore: body.popularityScore || 50,
        costIndex: body.costIndex || 50,
      },
    });
    return NextResponse.json(city);
  } catch {
    return NextResponse.json({ error: "Failed to create city" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "City id is required" }, { status: 400 });
    const city = await prisma.city.update({
      where: { id: body.id },
      data: {
        name: body.name,
        country: body.country,
        region: body.region,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        popularityScore: body.popularityScore,
        costIndex: body.costIndex,
      },
    });
    return NextResponse.json(city);
  } catch {
    return NextResponse.json({ error: "Failed to update city" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "City id is required" }, { status: 400 });
    await prisma.city.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete city" }, { status: 500 });
  }
}
