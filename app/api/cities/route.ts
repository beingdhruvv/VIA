import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CITY_IMAGES, cityImageKey } from "@/lib/place-images";

const createCitySchema = z.object({
  name: z.string().min(2).max(80),
  country: z.string().min(2).max(80),
  region: z.string().min(2).max(80).optional(),
  costIndex: z.number().min(1).max(15).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

function caseInsensitive() {
  return process.env.DATABASE_URL?.startsWith("postgresql")
    ? ({ mode: "insensitive" as const } as const)
    : ({} as const);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createCitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid city details" }, { status: 400 });
  }

  const data = parsed.data;
  const fold = caseInsensitive();
  const existing = await prisma.city.findFirst({
    where: {
      name: { equals: data.name.trim(), ...fold },
      country: { equals: data.country.trim(), ...fold },
    },
  });

  if (existing) return NextResponse.json(existing);

  const imageUrl = CITY_IMAGES[cityImageKey(data.name.trim(), data.country.trim())] ?? null;
  const city = await prisma.city.create({
    data: {
      name: data.name.trim(),
      country: data.country.trim(),
      region: data.region?.trim() || "Custom",
      costIndex: data.costIndex ?? 3.5,
      popularityScore: 35,
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      imageUrl,
    },
  });

  return NextResponse.json(city, { status: 201 });
}
