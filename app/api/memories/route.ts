import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_STORAGE = 200 * 1024 * 1024; // 200MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tripId = formData.get("tripId") as string | null;
    const metadataStr = formData.get("metadata") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check storage limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true }
    });

    if (user && user.storageUsed + file.size > MAX_STORAGE) {
      return NextResponse.json({ error: "Storage limit exceeded (200MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const fileName = `${session.user.id.slice(0, 8)}-${timestamp}-${safeName}`;
    const relativePath = `/uploads/memories/${fileName}`;
    const absolutePath = join(process.cwd(), "public", relativePath);
    const dirPath = join(process.cwd(), "public", "uploads", "memories");
    await mkdir(dirPath, { recursive: true });

    await writeFile(absolutePath, buffer);

    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    const memory = await prisma.memory.create({
      data: {
        userId: session.user.id,
        tripId: tripId || null,
        imageUrl: relativePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        caption: caption,
        takenAt: metadata.takenAt ? new Date(metadata.takenAt) : null,
        latitude: metadata.latitude || null,
        longitude: metadata.longitude || null,
        locationName: metadata.locationName || null,
      }
    });

    // Update user storage
    await prisma.user.update({
      where: { id: session.user.id },
      data: { storageUsed: { increment: file.size } }
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error("Memory Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload memory" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  try {
    const memories = await prisma.memory.findMany({
      where: { 
        userId: session.user.id,
        ...(tripId ? { tripId } : {})
      },
      include: {
        trip: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error("Fetch Memories Error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}
