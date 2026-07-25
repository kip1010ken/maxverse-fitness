import { sql } from "./_lib/db";
import { requireAuth } from "./_lib/auth";
import { initiateStkPush } from "./_lib/daraja";
import { DARAJA_PHONE_PATTERN } from "./_lib/phone";
import { sanitize } from "./_lib/sanitize";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const userId = await requireAuth(event);
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const itemType = payload.itemType;
  const itemId = typeof payload.itemId === "string" ? payload.itemId : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const recipientName = sanitize(payload.recipientName, 100);
  const deliveryAddress = sanitize(payload.deliveryAddress, 300);
  const deliveryNotes = sanitize(payload.deliveryNotes, 500);

  if ((itemType !== "plan" && itemType !== "product") || !itemId || !DARAJA_PHONE_PATTERN.test(phone)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
  }

  // Plans have nothing to ship — only physical goods need a delivery address.
  if (itemType === "product" && (!recipientName || !deliveryAddress)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Recipient name and delivery address are required" }) };
  }

  const item =
    itemType === "plan"
      ? (await sql`select id, name, price_kes from plans where id = ${itemId} and is_active = true`)[0]
      : (await sql`select id, name, price_kes from products where id = ${itemId} and is_active = true`)[0];

  if (!item) {
    return { statusCode: 404, body: JSON.stringify({ error: "Item not found" }) };
  }

  // Without this, a signed-in user could spam any Kenyan phone number with
  // unlimited M-Pesa prompts — the phone field isn't verified to be theirs.
  const [{ count }] = await sql`
    select count(*)::int as count
    from orders
    where user_id = ${userId} and created_at > now() - interval '10 minutes'
  `;

  if (count >= 5) {
    return { statusCode: 429, body: JSON.stringify({ error: "Too many payment attempts — try again shortly" }) };
  }

  const orderRows = await sql`
    insert into orders (
      user_id, item_type, item_id, item_name, amount_kes, phone,
      recipient_name, delivery_address, delivery_notes
    )
    values (
      ${userId}, ${itemType}, ${itemId}, ${item.name}, ${item.price_kes}, ${phone},
      ${recipientName || null}, ${deliveryAddress || null}, ${deliveryNotes || null}
    )
    returning id
  `;
  const orderId = orderRows[0].id;

  try {
    const stkResponse = await initiateStkPush({
      phone,
      amount: item.price_kes,
      accountReference: orderId,
      transactionDesc: `Maxverse ${item.name}`,
    });

    await sql`
      update orders
      set mpesa_checkout_request_id = ${stkResponse.CheckoutRequestID}
      where id = ${orderId}
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, checkoutRequestId: stkResponse.CheckoutRequestID }),
    };
  } catch {
    await sql`update orders set status = 'failed', updated_at = now() where id = ${orderId}`;
    return { statusCode: 502, body: JSON.stringify({ error: "Could not start M-Pesa payment" }) };
  }
});
