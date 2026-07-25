import type { Handler } from "@netlify/functions";
import { sql } from "./_lib/db";
import { requireAuth } from "./_lib/auth";

export const handler: Handler = async (event) => {
  const userId = await requireAuth(event);

  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const rows = await sql`
    insert into users (id)
    values (${userId})
    on conflict (id) do update set id = excluded.id
    returning id, phone, full_name, created_at
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows[0]),
  };
};
