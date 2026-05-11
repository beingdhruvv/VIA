import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatar-${session.user.id.slice(0, 8)}-${timestamp}.${extension}`;
    const relativePath = `/api/uploads/avatars/${fileName}`;
    const absolutePath = join(process.cwd(), "storage", "uploads", "avatars", fileName);
    const dirPath = join(process.cwd(), "storage", "uploads", "avatars");
    
    await mkdir(dirPath, { recursive: true });
    await writeFile(absolutePath, buffer);

    // Update user avatarUrl in DB
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: relativePath },
      select: { id: true, avatarUrl: true }
    });

    return NextResponse.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
