import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get cities the user has already swiped
    const swiped = await prisma.userTaste.findMany({
      where: { userId: session.user.id },
      select: { cityId: true },
    });
    const swipedIds = swiped.map((s) => s.cityId);

    const likedCitiesData = likedCities.map(lc => lc.city);
    const preferredRegions = new Set(likedCitiesData.map(c => c.region));
    const avgLikedCost = likedCitiesData.length > 0 
      ? likedCitiesData.reduce((acc, c) => acc + c.costIndex, 0) / likedCitiesData.length 
      : null;
    
    // Add user's home region if available
    let homeRegion: string | undefined;
    if (session.user.homeCity) {
      const homeCityData = await prisma.city.findFirst({
        where: { name: session.user.homeCity }
      });
      if (homeCityData) {
        preferredRegions.add(homeCityData.region);
        homeRegion = homeCityData.region;
      }
    }

    const preferredRegionsList = Array.from(preferredRegions);

    // Get cities not swiped yet, including their activities
    const cities = await prisma.city.findMany({
      where: {
        id: { notIn: swipedIds },
      },
      include: {
        activities: { take: 3 }
      },
      orderBy: [
        { popularityScore: "desc" },
      ],
      take: 40, // Fetch more for better sorting
    });

    // Intense Recommendation Logic:
    // 1. Home Region Boost (+5) - High local relevance
    // 2. Liked Region Boost (+3) - Proven interest
    // 3. Cost Similarity Boost (+2) - Within 25% of avg liked cost
    // 4. Popularity Baseline (+1 per 20 points)
    const sortedCities = [...cities].map(city => {
      let score = 0;
      
      if (city.region === homeRegion) score += 5;
      if (preferredRegionsList.includes(city.region)) score += 3;
      
      if (avgLikedCost !== null) {
        const costDiff = Math.abs(city.costIndex - avgLikedCost) / avgLikedCost;
        if (costDiff < 0.25) score += 2;
      }
      
      score += city.popularityScore / 20;
      
      return { ...city, recScore: score };
    })
    .sort((a, b) => b.recScore - a.recScore)
    .slice(0, 15);

    return NextResponse.json(sortedCities);
  } catch (error) {
    console.error("Explore API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
