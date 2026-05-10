import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API to upsert a user after they sign in with Firebase on the client.
 * This ensures the user exists in our DB and their DP is up to date.
 */
export async function POST(request: Request) {
  try {
    const { email, name, image } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Upsert user based on email
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || "Google User",
        avatarUrl: image, // Update the DP
      },
      create: {
        email,
        name: name || "Google User",
        avatarUrl: image,
        passwordHash: "FIREBASE_AUTH", // Placeholder for non-password users
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
