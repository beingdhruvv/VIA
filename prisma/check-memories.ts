import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.memory.count();
  const memories = await prisma.memory.findMany({ take: 5 });
  console.log(`Total memories: ${count}`);
  console.log("Sample memories:", JSON.stringify(memories, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
