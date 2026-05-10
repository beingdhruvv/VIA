import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const activities = await prisma.activity.findMany({
    where: {
      cityId: id,
      ...(category ? { category } : {}),
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json(activities, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
