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
      select id, client_name, before_image_url, after_image_url, summary, is_published, created_at
      from progress_entries
      order by created_at desc
      limit 200
    `;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows) };
  }

  if (event.httpMethod === "POST") {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(event.body ?? "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const clientName = sanitize(payload.clientName, 100);
    const beforeUrl = sanitize(payload.beforeImageUrl, 500);
    const afterUrl = sanitize(payload.afterImageUrl, 500);
    const summary = sanitize(payload.summary, 500);

    if (!clientName || !beforeUrl || !afterUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const rows = await sql`
      insert into progress_entries (client_name, before_image_url, after_image_url, summary)
      values (${clientName}, ${beforeUrl}, ${afterUrl}, ${summary || null})
      returning id, client_name, before_image_url, after_image_url, summary, is_published, created_at
    `;

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows[0]) };
  }

  if (event.httpMethod === "PATCH") {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(event.body ?? "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const id = typeof payload.id === "string" ? payload.id : "";

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
    }

    await sql`update progress_entries set is_published = ${Boolean(payload.isPublished)} where id = ${id}`;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
});
