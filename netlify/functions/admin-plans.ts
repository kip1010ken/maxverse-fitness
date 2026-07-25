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
      select id, slug, name, price_kes, cadence, intensity, features, is_active
      from plans
      order by sort_order asc
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
    const name = sanitize(payload.name, 100);
    const cadence = sanitize(payload.cadence, 20);
    const priceKes = Number(payload.priceKes);
    const intensity = Number(payload.intensity);
    const features = Array.isArray(payload.features)
      ? payload.features.map((feature) => sanitize(feature, 200)).filter(Boolean).slice(0, 12)
      : [];
    const isActive = Boolean(payload.isActive);

    const isValid =
      id &&
      name &&
      cadence &&
      Number.isFinite(priceKes) &&
      priceKes > 0 &&
      Number.isInteger(intensity) &&
      intensity >= 1 &&
      intensity <= 8 &&
      features.length > 0;

    if (!isValid) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
    }

    await sql`
      update plans
      set name = ${name},
          price_kes = ${priceKes},
          cadence = ${cadence},
          intensity = ${intensity},
          features = ${JSON.stringify(features)}::jsonb,
          is_active = ${isActive}
      where id = ${id}
    `;

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
});
