import type { Handler } from "@netlify/functions";
import { sql } from "./_lib/db";

export const handler: Handler = async () => {
  const rows = await sql`
    select id, client_name, before_image_url, after_image_url, summary, created_at
    from progress_entries
    where is_published = true
    order by created_at desc
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  };
};
