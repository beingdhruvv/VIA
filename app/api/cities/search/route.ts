import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** PostgreSQL supports Prisma `mode: 'insensitive'`; SQLite dev does not. */
function caseInsensitive() {
  return process.env.DATABASE_URL?.startsWith("postgresql")
    ? ({ mode: "insensitive" as const } as const)
    : ({} as const);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);
  const countryCode = searchParams.get("countryCode")?.trim();

  if (!q) {
    return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=60" } });
  }

  const fold = caseInsensitive();

  const dbResults = await prisma.city.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: q, ...fold } },
            { country: { contains: q, ...fold } },
            { region: { contains: q, ...fold } },
          ],
        },
        ...(countryCode
          ? [{ country: { contains: countryCode, ...fold } }]
          : []),
      ],
    },
    take: limit,
    orderBy: { popularityScore: "desc" },
  });

  const formatted = dbResults.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    costIndex: c.costIndex,
    popularityScore: c.popularityScore,
    latitude: c.latitude,
    longitude: c.longitude,
  }));

  return NextResponse.json(formatted, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
  });
}
