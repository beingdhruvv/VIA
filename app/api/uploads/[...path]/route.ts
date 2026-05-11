import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import { extname, resolve } from "path";

interface Props {
  params: Promise<{ path: string[] }>;
}

const PRIVATE_UPLOAD_ROOT = resolve(process.cwd(), "storage", "uploads");
const LEGACY_PUBLIC_UPLOAD_ROOT = resolve(process.cwd(), "public", "uploads");

const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function pathInside(root: string, candidate: string) {
  return candidate === root || candidate.startsWith(`${root}\\`) || candidate.startsWith(`${root}/`);
}

async function canReadUpload(sessionUserId: string, uploadPath: string) {
  if (uploadPath.startsWith("avatars/")) return true;

  const dbPaths = [`/api/uploads/${uploadPath}`, `/uploads/${uploadPath}`];
  const memory = await prisma.memory.findFirst({
    where: {
      imageUrl: { in: dbPaths },
      OR: [
        { userId: sessionUserId },
        { shares: { some: { userId: sessionUserId } } },
        { trip: { userId: sessionUserId } },
        { trip: { collaborators: { some: { userId: sessionUserId } } } },
      ],
    },
    select: { id: true },
  });

  return !!memory;
}

export async function GET(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { path } = await params;
  if (!path.length || path.some((segment) => segment === ".." || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const relativePath = path.join("/");
  if (!(await canReadUpload(session.user.id, relativePath))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const privatePath = resolve(PRIVATE_UPLOAD_ROOT, ...path);
  const legacyPath = resolve(LEGACY_PUBLIC_UPLOAD_ROOT, ...path);
  if (!pathInside(PRIVATE_UPLOAD_ROOT, privatePath) || !pathInside(LEGACY_PUBLIC_UPLOAD_ROOT, legacyPath)) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const filePath = existsSync(privatePath) ? privatePath : legacyPath;
  const fileInfo = await stat(filePath).catch(() => null);
  if (!fileInfo?.isFile()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const file = await readFile(filePath);
  const contentType = MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Cache-Control": "private, max-age=300",
      "Content-Length": String(file.length),
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
