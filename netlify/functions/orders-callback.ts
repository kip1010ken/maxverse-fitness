import { sql } from "./_lib/db";
import { withErrorHandling } from "./_lib/withHandler";

type StkCallbackItem = { Name: string; Value?: unknown };

// Called by Safaricom's servers, not the browser — this is the server-side
// source of truth for payment status. Never mark an order paid from a
// client-reported status.
export const handler = withErrorHandling(async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (event.queryStringParameters?.token !== process.env.DARAJA_CALLBACK_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  let payload: {
    Body?: {
      stkCallback?: {
        CheckoutRequestID?: string;
        ResultCode?: number;
        CallbackMetadata?: { Item?: StkCallbackItem[] };
      };
    };
  };

  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const callback = payload.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;

  if (!callback || !checkoutRequestId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Malformed callback" }) };
  }

  if (callback.ResultCode === 0) {
    const items = callback.CallbackMetadata?.Item ?? [];
    const receipt = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value;

    await sql`
      update orders
      set status = 'paid', mpesa_receipt_number = ${typeof receipt === "string" ? receipt : null}, updated_at = now()
      where mpesa_checkout_request_id = ${checkoutRequestId}
    `;
  } else {
    await sql`
      update orders
      set status = 'failed', updated_at = now()
      where mpesa_checkout_request_id = ${checkoutRequestId}
    `;
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
  };
});
