import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5", 10), 20);

  if (!q) return NextResponse.json([]);

  try {
    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { stops: { some: { city: { name: { contains: q } } } } }
        ]
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        stops: { take: 1, include: { city: true } }
      }
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Trip search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
