import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { City } from "@prisma/client";

interface ExploreCityResponse extends City {
  recScore: number;
  activities: { id: string; name: string; estimatedCost: number; category: string }[];
}
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get cities the user has already swiped
    const swiped = await prisma.userTaste.findMany({
      where: { userId: session.user.id },
      select: { cityId: true },
    });
    const likedCities = await prisma.userTaste.findMany({
      where: { userId: session.user.id, type: "LIKE" },
      include: { city: true },
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

    // Intense Recommendation Logic with Diversity Filter:
    // 1. Home Region Boost (+5)
    // 2. Liked Region Boost (+3)
    // 3. Cost Similarity Boost (+2)
    // 4. ML Similarity Mock (+2) - Simulate "Users like you also liked..."
    // 5. Diversity Decay (-2 if too many from same region)
    
    const regionCounts: Record<string, number> = {};
    const sortedCities = [...cities].map((city): ExploreCityResponse => {
      let score = 0;
      
      // Home & Liked region boosts
      if (city.region === homeRegion) score += 5;
      if (preferredRegionsList.includes(city.region)) score += 3;
      
      // Cost similarity
      if (avgLikedCost !== null) {
        const costDiff = Math.abs(city.costIndex - avgLikedCost) / avgLikedCost;
        if (costDiff < 0.25) score += 2;
      }

      // Mock ML Similarity (based on cross-region popularity patterns)
      // If user likes Europe, show them a bit of Japan (similar vibe/score)
      const isMLSimilar = city.popularityScore > 80 && !preferredRegionsList.includes(city.region);
      if (isMLSimilar) score += 1.5;
      
      score += city.popularityScore / 20;
      
      return { 
        ...city, 
        recScore: score,
        activities: city.activities.map(a => ({
          id: a.id,
          name: a.name,
          estimatedCost: a.estimatedCost,
          category: a.category,
          imageUrl: a.imageUrl
        }))
      };
    })
    .sort((a, b) => b.recScore - a.recScore);

    // Apply Diversity Decay:
    // Ensure we don't show more than 4 cities from the same region in the final 15
    const finalCities: ExploreCityResponse[] = [];
    sortedCities.forEach(city => {
      regionCounts[city.region] = (regionCounts[city.region] || 0) + 1;
      if (regionCounts[city.region] <= 4) {
        finalCities.push(city);
      } else if (finalCities.length < 15) {
        // Only add if we don't have enough cities yet, but with lower priority
        finalCities.push({ ...city, recScore: city.recScore - 4 });
      }
    });

    return NextResponse.json(finalCities.sort((a, b) => b.recScore - a.recScore).slice(0, 15));
  } catch {
    console.error("Explore API Error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
