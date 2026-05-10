import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Curated Picsum photo IDs that look like travel/city photos
const CITY_IMAGES = {
  // India
  "Mumbai": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=500&fit=crop",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop",
  "Ahmedabad": "https://images.unsplash.com/photo-1598320066938-d0e5a04f4e8a?w=800&h=500&fit=crop",
  "Rann of Kutch": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop",
  "Somnath": "https://picsum.photos/seed/Somnath/800/500",
  "Dwarka": "https://picsum.photos/seed/Dwarka/800/500",
  "Gir": "https://images.unsplash.com/photo-1474514644-3c5e44cd73e5?w=800&h=500&fit=crop",
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=500&fit=crop",
  "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=500&fit=crop",
  "Jodhpur": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=500&fit=crop",
  "Udaipur": "https://images.unsplash.com/photo-1585320806297-9794b3e4abb2?w=800&h=500&fit=crop",
  "Pushkar": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=500&fit=crop",
  "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=500&fit=crop",
  "Varanasi": "https://images.unsplash.com/photo-1561361058-c24e017b2f74?w=800&h=500&fit=crop",
  "Lucknow": "https://picsum.photos/seed/Lucknow/800/500",
  "Rishikesh": "https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=800&h=500&fit=crop",
  "Dehradun": "https://picsum.photos/seed/Dehradun/800/500",
  "Mussoorie": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
  "Manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=500&fit=crop",
  "Shimla": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&h=500&fit=crop",
  "Chandigarh": "https://picsum.photos/seed/Chandigarh/800/500",
  "Amritsar": "https://images.unsplash.com/photo-1585132600744-32e5c6ba7be7?w=800&h=500&fit=crop",
  "Srinagar": "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&h=500&fit=crop",
  "Leh": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
  "Darjeeling": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=500&fit=crop",
  "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=500&fit=crop",
  "Patna": "https://picsum.photos/seed/Patna/800/500",
  "Ranchi": "https://picsum.photos/seed/Ranchi/800/500",
  "Bhubaneswar": "https://picsum.photos/seed/Bhubaneswar/800/500",
  "Puri": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=500&fit=crop",
  "Hyderabad": "https://images.unsplash.com/photo-1626209571049-c4d7427beacb?w=800&h=500&fit=crop",
  "Chennai": "https://images.unsplash.com/photo-1545573358-e1a2f8af8b15?w=800&h=500&fit=crop",
  "Ooty": "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800&h=500&fit=crop",
  "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=500&fit=crop",
  "Mysore": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=500&fit=crop",
  "Hampi": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
  "Kochi": "https://images.unsplash.com/photo-1609919009811-ce05c26d9e1a?w=800&h=500&fit=crop",
  "Munnar": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&h=500&fit=crop",
  "Alleppey": "https://images.unsplash.com/photo-1602301840424-4f04eabc4e6a?w=800&h=500&fit=crop",
  "Bhopal": "https://picsum.photos/seed/Bhopal/800/500",
  "Indore": "https://picsum.photos/seed/Indore/800/500",
  "Raipur": "https://picsum.photos/seed/Raipur/800/500",
  // International
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=800&h=500&fit=crop",
  "Prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=500&fit=crop",
  "Lisbon": "https://images.unsplash.com/photo-1585208798174-6cedd4de4b99?w=800&h=500&fit=crop",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=500&fit=crop",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800&h=500&fit=crop",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop",
};

async function main() {
  const cities = await prisma.city.findMany({ select: { id: true, name: true } });
  let updated = 0;
  for (const city of cities) {
    const imageUrl = CITY_IMAGES[city.name];
    if (imageUrl) {
      await prisma.city.update({ where: { id: city.id }, data: { imageUrl } });
      updated++;
      console.log(`✓ ${city.name}`);
    } else {
      // Fallback: Picsum with city name seed
      await prisma.city.update({
        where: { id: city.id },
        data: { imageUrl: `https://picsum.photos/seed/${encodeURIComponent(city.name)}/800/500` }
      });
      updated++;
      console.log(`~ ${city.name} (picsum fallback)`);
    }
  }
  console.log(`\nUpdated ${updated} cities`);
  await prisma.$disconnect();
}

main().catch(console.error);
