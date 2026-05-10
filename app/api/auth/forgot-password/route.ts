import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  // Always return 200 to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    // TODO: send reset email via SMTP when email service is configured
    // For now, log the intent server-side only
    console.log(`[forgot-password] reset requested for ${parsed.data.email}`);
  }

  return NextResponse.json({ ok: true });
}
