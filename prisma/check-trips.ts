import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trips = await prisma.trip.findMany({ 
    take: 5,
    include: { stops: { include: { city: true } } }
  });
  console.log("Sample trips:", JSON.stringify(trips, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
