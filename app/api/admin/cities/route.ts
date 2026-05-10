import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      take: 50, // Limit for now
    });
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
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
