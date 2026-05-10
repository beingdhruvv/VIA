import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = process.argv[2] ?? process.env.VIA_ADMIN_EMAIL;
  if (!email) {
    console.error("Pass email: VIA_ADMIN_EMAIL=... npx tsx scripts/check-role.ts or npx tsx scripts/check-role.ts you@example.com");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("USER_ROLE_CHECK:", user?.role);
}
main().finally(() => prisma.$disconnect());
