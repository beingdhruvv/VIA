import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { privateUploadPathFromUrl } from "@/lib/upload-paths";

const DEFAULT_STORAGE_LIMIT = 200 * 1024 * 1024; // 200MB

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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
    }

    // Check storage limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true, storageLimit: true }
    });

    const storageLimit = user?.storageLimit ?? DEFAULT_STORAGE_LIMIT;
    if (user && user.storageUsed + file.size > storageLimit) {
      return NextResponse.json({ error: `Storage limit exceeded (${Math.round(storageLimit / (1024 * 1024))}MB)` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const fileName = `${session.user.id.slice(0, 8)}-${timestamp}-${safeName}`;
    const relativePath = `/api/uploads/memories/${fileName}`;
    const absolutePath = join(process.cwd(), "storage", "uploads", "memories", fileName);
    const dirPath = join(process.cwd(), "storage", "uploads", "memories");
    await mkdir(dirPath, { recursive: true });

    await writeFile(absolutePath, buffer);

    const metadata: MemoryMetadata = metadataStr ? JSON.parse(metadataStr) : {};

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
  } catch (error: unknown) {
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
        OR: [
          { userId: session.user.id },
          { shares: { some: { userId: session.user.id } } }
        ],
        ...(tripId ? { tripId } : {})
      },
      include: {
        trip: {
          select: { name: true }
        },
        shares: {
          select: {
            user: { select: { id: true, email: true, name: true } },
            sharedBy: { select: { id: true, email: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(memories.map((memory) => ({
      ...memory,
      sharedWith: memory.shares.map((share) => share.user),
      sharedBy: memory.userId === session.user.id ? null : memory.shares.find((share) => share.user.id === session.user.id)?.sharedBy ?? null,
      canDelete: memory.userId === session.user.id,
      shares: undefined,
    })));
  } catch (error: unknown) {
    console.error("Fetch Memories Error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ids, emails } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Select at least one memory" }, { status: 400 });
    }

    const normalizedEmails = Array.from(new Set(
      (Array.isArray(emails) ? emails : String(emails ?? "").split(","))
        .map((email) => String(email).trim().toLowerCase())
        .filter(Boolean)
    ));

    if (normalizedEmails.length === 0) {
      return NextResponse.json({ error: "Enter at least one user email" }, { status: 400 });
    }

    const [memories, recipients] = await Promise.all([
      prisma.memory.findMany({
        where: { id: { in: ids }, userId: session.user.id },
        select: { id: true }
      }),
      prisma.user.findMany({
        where: { email: { in: normalizedEmails } },
        select: { id: true, email: true, name: true }
      })
    ]);

    if (memories.length === 0) {
      return NextResponse.json({ error: "Only owned memories can be shared" }, { status: 403 });
    }

    const recipientsToShare = recipients.filter((user) => user.id !== session.user.id);
    if (recipientsToShare.length === 0) {
      return NextResponse.json({ error: "No matching internal users found" }, { status: 404 });
    }

    for (const memory of memories) {
      for (const user of recipientsToShare) {
        await prisma.memoryShare.upsert({
          where: {
            memoryId_userId: {
              memoryId: memory.id,
              userId: user.id,
            },
          },
          update: {},
          create: {
            memoryId: memory.id,
            userId: user.id,
            sharedById: session.user.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: memories.length * recipientsToShare.length,
      users: recipientsToShare,
    });
  } catch (error: unknown) {
    console.error("Share Memories Error:", error);
    return NextResponse.json({ error: "Failed to share memories" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const ids = body.ids;
    if (!ids || !Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // 1. Get memories to find file paths and sizes
    const memories = await prisma.memory.findMany({
      where: {
        id: { in: ids },
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
        const uploadPath = privateUploadPathFromUrl(memory.imageUrl);
        const absolutePath = join(process.cwd(), "storage", "uploads", uploadPath);
        const legacyPath = join(process.cwd(), "public", "uploads", uploadPath);
        await unlink(absolutePath).catch(() => {}); // Ignore errors if file already gone
        await unlink(legacyPath).catch(() => {});
        totalSizeRemoved += memory.fileSize as number;
      } catch (err) {
        console.warn(`Failed to delete file: ${memory.imageUrl}`, err);
      }
    }

    // 3. Delete from DB
    await prisma.memory.deleteMany({
      where: { id: { in: deletedIds }, userId: session.user.id }
    });

    // 4. Update user storage
    await prisma.user.update({
      where: { id: session.user.id },
      data: { storageUsed: { decrement: totalSizeRemoved } }
    });

    return NextResponse.json({ success: true, count: deletedIds.length });
  } catch (error: unknown) {
    console.error("Delete Memories Error:", error);
    return NextResponse.json({ error: "Failed to delete memories" }, { status: 500 });
  }
}
