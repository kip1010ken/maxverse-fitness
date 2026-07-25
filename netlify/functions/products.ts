import { sql } from "./_lib/db";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async () => {
  const rows = await sql`
    select id, category, name, price_kes, note, image_url
    from products
    where is_active = true
    order by sort_order asc
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  };
});
