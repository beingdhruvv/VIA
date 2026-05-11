import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
    }
  });

  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admins can manage roles" }, { status: 403 });
  }

  try {
    const { userId, role, storageLimitMb } = await request.json();
    const data: { role?: string; storageLimit?: number } = {};

    if (role !== undefined && !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role !== undefined) data.role = role;

    if (storageLimitMb !== undefined) {
      const mb = Number(storageLimitMb);
      if (!Number.isFinite(mb) || mb < 10 || mb > 10240) {
        return NextResponse.json({ error: "Storage limit must be 10MB to 10240MB" }, { status: 400 });
      }
      data.storageLimit = Math.round(mb * 1024 * 1024);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
