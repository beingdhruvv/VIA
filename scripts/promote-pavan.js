/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function promote() {
  const email = process.argv[2] || process.env.VIA_ADMIN_EMAIL;
  if (!email) {
    console.error("Usage: VIA_ADMIN_EMAIL=you@example.com node scripts/promote-pavan.js or node scripts/promote-pavan.js you@example.com");
    process.exit(1);
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const res = await client.query(
    "UPDATE users SET role = 'SUPER_ADMIN' WHERE email = $1 RETURNING id, email, role",
    [email]
  );
  console.log("Promoted user:", res.rows[0]);
  await client.end();
}

promote().catch(console.error);
