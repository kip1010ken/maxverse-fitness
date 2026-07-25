import { sql } from "./_lib/db";
import { requireAuth } from "./_lib/auth";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  const userId = await requireAuth(event);
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const orderId = event.queryStringParameters?.orderId;
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing orderId" }) };
  }

  const rows = await sql`
    select id, status, item_name, amount_kes, mpesa_receipt_number
    from orders
    where id = ${orderId} and user_id = ${userId}
  `;

  if (!rows[0]) {
    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows[0]),
  };
});
