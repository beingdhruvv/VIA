import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

const MAX_STORAGE = 200 * 1024 * 1024; // 200MB

interface MemoryMetadata {
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

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
      // @ts-ignore
      select: { storageUsed: true }
    });

    // @ts-ignore
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

    const metadata: MemoryMetadata = metadataStr ? JSON.parse(metadataStr) : {};

    // @ts-ignore
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
      // @ts-ignore
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
    // @ts-ignore
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

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // 1. Get memories to find file paths and sizes
    // @ts-ignore
    const memories = await prisma.memory.findMany({
      where: {
        id: { in: ids as string[] },
        userId: session.user.id,
      },
      select: {
        id: true,
        imageUrl: true,
        fileSize: true,
      }
    });

    if (memories.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const deletedIds = memories.map((m: { id: string }) => m.id);

    // 2. Delete physical files
    let totalSizeRemoved = 0;
    for (const memory of memories) {
      try {
        const absolutePath = join(process.cwd(), "public", memory.imageUrl);
        await unlink(absolutePath).catch(() => {}); // Ignore errors if file already gone
        totalSizeRemoved += memory.fileSize;
      } catch (err) {
        console.warn(`Failed to delete file: ${memory.imageUrl}`, err);
      }
    }

    // 3. Delete from DB
    // @ts-ignore
    await prisma.memory.deleteMany({
      where: { id: { in: deletedIds } }
    });

    // 4. Update user storage
    await prisma.user.update({
      where: { id: session.user.id },
      // @ts-ignore
      data: { storageUsed: { decrement: totalSizeRemoved } }
    });

    return NextResponse.json({ success: true, count: deletedIds.length });
  } catch (error) {
    console.error("Delete Memories Error:", error);
    return NextResponse.json({ error: "Failed to delete memories" }, { status: 500 });
  }
}
