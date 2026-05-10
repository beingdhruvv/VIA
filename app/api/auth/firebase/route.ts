import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, name, image } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPw = randomBytes(32).toString("hex");
      const passwordHash = await hash(randomPw, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          passwordHash,
          avatarUrl: image || null,
        },
      });
    } else if (image && !user.avatarUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: image },
      });
    }

    return NextResponse.json({ ok: true, name: user.name });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
