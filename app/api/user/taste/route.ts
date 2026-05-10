import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cityId, type } = await req.json();

  if (!cityId || !["LIKE", "DISLIKE", "SAVE"].includes(type)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const taste = await prisma.userTaste.upsert({
      where: {
        userId_cityId: {
          userId: session.user.id,
          cityId,
        },
      },
      update: { type },
      create: {
        userId: session.user.id,
        cityId,
        type,
      },
    });

    return NextResponse.json(taste);
  } catch (error) {
    console.error("Taste API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tastes = await prisma.userTaste.findMany({
      where: { userId: session.user.id },
      include: { city: true },
    });

    return NextResponse.json(tastes);
  } catch (error) {
    console.error("Taste GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { cityId } = await req.json();
    if (!cityId) return NextResponse.json({ error: "City ID required" }, { status: 400 });

    await prisma.userTaste.delete({
      where: {
        userId_cityId: {
          userId: session.user.id,
          cityId,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Taste DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
