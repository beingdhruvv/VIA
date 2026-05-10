import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const users = await p.user.findMany({ select: { email: true, name: true, passwordHash: true } });
console.log("count:", users.length);
users.forEach(u => console.log(u.email, u.name, u.passwordHash?.slice(0,7)));
await p.$disconnect();
