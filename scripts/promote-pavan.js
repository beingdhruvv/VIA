/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function promote() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const res = await client.query(
    "UPDATE users SET role = 'SUPER_ADMIN' WHERE email = $1 RETURNING id, email, role",
    ["pavan.code.io@gmail.com"]
  );
  console.log("Promoted user:", res.rows[0]);
  await client.end();
}

promote().catch(console.error);
