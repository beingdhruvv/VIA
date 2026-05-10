import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ExploreSwiper } from "@/components/explore/ExploreSwiper";
import { Flame } from "lucide-react";
import type { SessionUser } from "@/types";

export default async function ExplorePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  // Get initial batch of cities the user hasn't swiped yet
  const swiped = await prisma.userTaste.findMany({
    where: { userId: session.user.id },
    select: { cityId: true },
  });
  const swipedIds = swiped.map((s) => s.cityId);

  const initialCities = await prisma.city.findMany({
    where: {
      id: { notIn: swipedIds },
    },
    take: 12,
    orderBy: { popularityScore: "desc" },
  });

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "Traveler",
    email: session.user.email,
    image: session.user.image,
    role: session.user.role as any,
  };

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] md:h-screen flex flex-col">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-via-red text-white font-mono text-[10px] uppercase tracking-widest mb-3">
            <Flame size={12} fill="currentColor" />
            Live Discovery
          </div>
          <h1 className="font-grotesk font-bold text-3xl text-via-black">Explore the World</h1>
          <p className="font-inter text-via-grey-mid mt-2">
            Swipe right to like, left to skip. Let us learn your taste.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <ExploreSwiper initialCities={initialCities} />
        </div>
      </div>
    </AppShell>
  );
}
