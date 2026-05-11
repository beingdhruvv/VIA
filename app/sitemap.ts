import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://via.stromlabs.tech'

  // Fetch all public trips for sitemap
  const publicTrips = await prisma.sharedLink.findMany({
    select: { slug: true }
  }).catch((error: unknown) => {
    console.warn("[sitemap] public trip lookup skipped", error);
    return [];
  })

  const tripUrls = publicTrips.map((link) => ({
    url: `${baseUrl}/trip/${link.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...tripUrls
  ]
}
