import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get cities the user has already swiped
    const swiped = await prisma.userTaste.findMany({
      where: { userId: session.user.id },
      select: { cityId: true },
    });
    const swipedIds = swiped.map((s) => s.cityId);

    // Get random cities not swiped yet
    const cities = await prisma.city.findMany({
      where: {
        id: { notIn: swipedIds },
      },
      take: 10,
      // In a real app, we might use popularity or a better recommendation engine
      orderBy: { popularityScore: "desc" },
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Explore API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
