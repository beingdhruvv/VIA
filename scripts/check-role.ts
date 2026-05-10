import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "pavan.code.io@gmail.com" } });
  console.log("USER_ROLE_CHECK:", user?.role);
}
main().finally(() => prisma.$disconnect());
