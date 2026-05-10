import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ExploreClient } from "./_ExploreClient";

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
    role: toSessionUserRole(session.user.role),
  };

  return (
    <AppShell user={user}>
      <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-h-[100dvh] w-full max-w-4xl flex-col px-3 pb-4 pt-3 sm:h-[calc(100dvh-4rem)] sm:px-4 sm:pt-4 md:px-6 md:pt-6">
        <header className="shrink-0 space-y-1 pb-2 text-center sm:space-y-1.5 sm:pb-3">
          <h1 className="font-grotesk text-xl font-bold leading-tight text-via-black sm:text-2xl md:text-3xl">
            Explore the World
          </h1>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center overflow-hidden">
          <ExploreClient initialCities={initialCities} />
        </div>
      </div>
    </AppShell>
  );
}
