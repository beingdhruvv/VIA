import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  language: z.string().min(2).max(10).optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  homeCity: z.string().min(1).nullable().optional(),
  homeCountry: z.string().min(1).nullable().optional(),
  genderPreference: z.enum(["ANY", "MALE", "FEMALE", "MIXED"]).optional(),
  travelStyle: z.enum(["SOLO", "COUPLE", "FRIENDS", "FAMILY"]).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
}).refine((d) => d.name || d.language || d.avatarUrl !== undefined || d.homeCity || d.homeCountry || d.genderPreference || d.travelStyle || (d.currentPassword && d.newPassword), {
  message: "Nothing to update",
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { name, language, currentPassword, newPassword } = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (name) updateData.name = name;
  if (language) updateData.language = language;
  if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.homeCity !== undefined) updateData.homeCity = parsed.data.homeCity;
  if (parsed.data.homeCountry !== undefined) updateData.homeCountry = parsed.data.homeCountry;
  if (parsed.data.genderPreference) updateData.genderPreference = parsed.data.genderPreference;
  if (parsed.data.travelStyle) updateData.travelStyle = parsed.data.travelStyle;

  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, language: true, genderPreference: true, travelStyle: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: 'Type "DELETE" to confirm account deletion' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
