import { sql } from "./_lib/db";
import { requireAdmin } from "./_lib/adminAuth";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  const adminId = await requireAdmin(event);
  if (!adminId) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
  }

  const rows = await sql`
    select id, name, phone, email, message, created_at
    from contact_messages
    order by created_at desc
    limit 100
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  };
});
