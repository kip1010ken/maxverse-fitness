import { readFileSync } from "node:fs";
import { Client } from "@neondatabase/serverless";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run db:migrate -- db/00X_something.sql");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set — source .env first (e.g. `set -a && source .env && set +a`).");
  process.exit(1);
}

const sql = readFileSync(filePath, "utf8");
const client = new Client(process.env.DATABASE_URL);

await client.connect();
try {
  await client.query(sql);
  console.log(`Applied ${filePath}`);
} finally {
  await client.end();
}
