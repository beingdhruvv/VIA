import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];
const role = process.argv[3] || "ADMIN";

async function main() {
  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: role as any },
  });

  console.log(`User ${user.email} updated to role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
