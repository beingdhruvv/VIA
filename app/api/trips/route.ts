import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid end date"),
  totalBudget: z.number().positive().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
  const status = searchParams.get("status") as string | null;
  const search = searchParams.get("search") as string | null;
  const sort = searchParams.get("sort") || "newest";

  const where = {
    userId: session.user.id,
    ...(status && { status: status as never }),
    ...(search && { name: { contains: search, mode: "insensitive" as never } }),
  };

  const orderBy =
    sort === "upcoming"
      ? { startDate: "asc" as never }
      : sort === "past"
      ? { endDate: "desc" as never }
      : { createdAt: "desc" as never };

  const trips = await prisma.trip.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      stops: {
        include: { city: true },
        orderBy: { orderIndex: "asc" },
      },
      _count: { select: { expenses: true, stops: true } },
    },
  });

  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, description, startDate, endDate, totalBudget, coverUrl } = parsed.data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      userId: session.user.id,
      name,
      description,
      startDate: start,
      endDate: end,
      totalBudget: totalBudget ?? null,
      coverUrl: coverUrl ?? null,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}

