import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? process.env.VIA_ADMIN_EMAIL;
  if (!email) {
    console.error("Usage: VIA_ADMIN_EMAIL=you@example.com npx tsx prisma/make-admin.ts\n   or: npx tsx prisma/make-admin.ts you@example.com");
    process.exit(1);
  }
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN" },
    create: {
      email,
      name: "Admin",
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
