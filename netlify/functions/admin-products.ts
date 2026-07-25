import { sql } from "./_lib/db";
import { requireAdmin } from "./_lib/adminAuth";
import { sanitize } from "./_lib/sanitize";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  const adminId = await requireAdmin(event);
  if (!adminId) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
  }

  if (event.httpMethod === "GET") {
    const rows = await sql`
      select id, category, name, price_kes, note, image_url
      from products
      order by category asc, sort_order asc
    `;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows) };
  }

  if (event.httpMethod === "PATCH") {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(event.body ?? "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const id = typeof payload.id === "string" ? payload.id : "";
    const imageUrl = sanitize(payload.imageUrl, 500);

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
    }

    await sql`update products set image_url = ${imageUrl || null} where id = ${id}`;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
});
