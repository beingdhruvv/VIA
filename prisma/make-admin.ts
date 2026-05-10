import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "pavan.code.io@gmail.com";
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN" },
    create: {
      email,
      name: "Pavan Admin",
      role: "SUPER_ADMIN",
      passwordHash: "ADMIN_PLACEHOLDER", // Should be changed on first login or handled via Firebase
    },
  });

  console.log(`User ${user.email} is now ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
