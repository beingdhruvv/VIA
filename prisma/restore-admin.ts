import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "pavan.code.io@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });
    console.log(`User ${email} promoted to SUPER_ADMIN`);
  } else {
    console.log(`User ${email} not found`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
