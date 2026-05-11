import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ExploreClient } from "./_ExploreClient";
import { toSessionUserRole } from "@/lib/roles";
import type { SessionUser } from "@/types";

export default async function ExplorePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  // Get initial batch of cities the user hasn't swiped yet
  const [swiped, profile] = await Promise.all([
    prisma.userTaste.findMany({
      where: { userId: session.user.id },
      select: { cityId: true, type: true, city: { select: { region: true } } },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { travelStyle: true, genderPreference: true, homeCountry: true },
    }),
  ]);
  const swipedIds = swiped.map((s) => s.cityId);
  const likedRegions = new Set(swiped.filter((taste) => taste.type !== "DISLIKE").map((taste) => taste.city.region));

  const candidateCities = await prisma.city.findMany({
    where: {
      id: { notIn: swipedIds },
    },
    include: {
      activities: { take: 3, orderBy: { rating: "desc" } },
    },
    take: 50,
    orderBy: { popularityScore: "desc" },
  });
  const budgetTarget = profile?.travelStyle === "FAMILY" ? 4 : profile?.travelStyle === "SOLO" ? 3 : 5;
  const initialCities = candidateCities
    .map((city) => ({
      city,
      score:
        city.popularityScore +
        (likedRegions.has(city.region) ? 12 : 0) +
        (profile?.homeCountry && city.country === profile.homeCountry ? 6 : 0) -
        Math.abs(city.costIndex - budgetTarget) * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => item.city);

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "Traveler",
    email: session.user.email ?? "",
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
