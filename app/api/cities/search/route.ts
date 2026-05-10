import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GeoDbCity {
  id: string | number;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface CityResult {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularityScore: number;
  latitude: number;
  longitude: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);
  const countryCode = searchParams.get("countryCode");

  if (!q) return NextResponse.json([], { headers: { "Cache-Control": "public, max-age=60" } });

  const dbResults = await prisma.city.findMany({
    where: {
      name: { contains: q },
      ...(countryCode ? { country: { contains: countryCode } } : {}),
    },
    take: limit,
    orderBy: { popularityScore: "desc" },
  });

  const formatted = dbResults.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    costIndex: c.costIndex,
    popularityScore: c.popularityScore,
    latitude: c.latitude,
    longitude: c.longitude,
  }));

  const apiKey = process.env.GEODB_API_KEY;
  if (!apiKey) return NextResponse.json(formatted);

  try {
    const geoUrl = new URL("https://wft-geo-db.p.rapidapi.com/v1/geo/cities");
    geoUrl.searchParams.set("namePrefix", q);
    geoUrl.searchParams.set("limit", String(limit));
    if (countryCode) geoUrl.searchParams.set("countryIds", countryCode);

    const res = await fetch(geoUrl.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return NextResponse.json(formatted);

    const data = await res.json();
    const externalCities: CityResult[] = (data.data ?? []).map(
      (city: GeoDbCity): CityResult => ({
        id: String(city.id),
        name: city.name,
        country: city.country,
        region: city.region ?? "",
        costIndex: 0,
        popularityScore: 0,
        latitude: city.latitude,
        longitude: city.longitude,
      })
    );

    const seen = new Set(formatted.map((c) => `${c.name}|${c.country}`));
    const deduped = [
      ...formatted,
      ...externalCities.filter((c) => !seen.has(`${c.name}|${c.country}`)),
    ].slice(0, limit);

    return NextResponse.json(deduped, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json(formatted, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  }
}

