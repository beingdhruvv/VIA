import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const slug = `${slugify(trip.name)}-${randomSuffix()}`;

  const existing = await prisma.sharedLink.findFirst({ where: { tripId: id } });
  const sharedLink = existing
    ? await prisma.sharedLink.update({ where: { id: existing.id }, data: { slug } })
    : await prisma.sharedLink.create({ data: { tripId: id, slug } });

  await prisma.trip.update({
    where: { id },
    data: { isPublic: true, publicSlug: slug },
  });

  return NextResponse.json({
    slug,
    url: `/trip/${slug}`,
    sharedLink,
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug query param is required" }, { status: 400 });
  }

  const sharedLink = await prisma.sharedLink.findUnique({ where: { slug } });
  if (!sharedLink) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const trip = await prisma.trip.findFirst({
    where: { id: sharedLink.tripId, isPublic: true },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: {
          city: true,
          activities: {
            include: { activity: true },
            orderBy: { scheduledTime: "asc" },
          },
        },
      },
    },
  });

  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.sharedLink.update({
    where: { id: sharedLink.id },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json(trip);
}
