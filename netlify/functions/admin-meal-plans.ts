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
      select id, name, price_kes, description, is_active
      from meal_plans
      order by sort_order asc
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

    const name = sanitize(payload.name, 100);
    const priceKes = Number(payload.priceKes);
    const description = sanitize(payload.description, 1000);

    const isValid = name && Number.isFinite(priceKes) && priceKes > 0 && description;

    if (!isValid) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
    }

    const rows = await sql`
      insert into meal_plans (name, price_kes, description)
      values (${name}, ${priceKes}, ${description})
      on conflict (name) do nothing
      returning id, name, price_kes, description, is_active
    `;

    if (!rows[0]) {
      return { statusCode: 409, body: JSON.stringify({ error: "A meal plan with this name already exists" }) };
    }

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
    const name = sanitize(payload.name, 100);
    const priceKes = Number(payload.priceKes);
    const description = sanitize(payload.description, 1000);
    const isActive = Boolean(payload.isActive);

    const isValid = id && name && Number.isFinite(priceKes) && priceKes > 0 && description;

    if (!isValid) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
    }

    await sql`
      update meal_plans
      set name = ${name}, price_kes = ${priceKes}, description = ${description}, is_active = ${isActive}
      where id = ${id}
    `;

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod === "DELETE") {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
    }

    await sql`delete from meal_plans where id = ${id}`;
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
});
