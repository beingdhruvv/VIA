import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];
const allowedRoles = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
type AllowedRole = (typeof allowedRoles)[number];

function parseRole(value: string | undefined): AllowedRole {
  return allowedRoles.find((role) => role === value) ?? "ADMIN";
}

const role = parseRole(process.argv[3]);

async function main() {
  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
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
