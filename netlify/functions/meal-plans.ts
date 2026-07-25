import { sql } from "./_lib/db";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async () => {
  const rows = await sql`
    select id, name, price_kes, description
    from meal_plans
    where is_active = true
    order by sort_order asc
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  };
});
