import { sql } from "./_lib/db";
import { requireAdmin } from "./_lib/adminAuth";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  const adminId = await requireAdmin(event);
  if (!adminId) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
  }

  const rows = await sql`
    select id, item_type, item_name, amount_kes, phone, recipient_name, delivery_address,
           delivery_notes, status, mpesa_receipt_number, created_at
    from orders
    order by created_at desc
    limit 200
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows),
  };
});
