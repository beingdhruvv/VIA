import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CitiesClient } from "./_CitiesClient";
import type { CityData } from "@/types";

export const metadata = { title: "Explore Cities — VIA" };

export default async function CitiesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = { id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "", image: session.user.image };

  const rawCities = await prisma.city.findMany({
    orderBy: [{ popularityScore: "desc" }, { name: "asc" }],
    take: 60,
  });

  const cities: CityData[] = rawCities.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    costIndex: c.costIndex,
    popularityScore: c.popularityScore,
    imageUrl: c.imageUrl,
    latitude: c.latitude,
    longitude: c.longitude,
  }));

  return (
    <AppShell user={user}>
      <div className="px-4 md:px-8 py-6">
        <PageHeader
          title="Explore Cities"
          subtitle={`${cities.length} destinations`}
          breadcrumb={[{ label: "Cities" }]}
        />
        <CitiesClient cities={cities} />
      </div>
    </AppShell>
  );
}
