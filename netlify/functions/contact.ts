import type { Handler } from "@netlify/functions";
import { sql } from "./_lib/db";

const PHONE_PATTERN = /^\+?\d{9,15}$/;

function sanitize(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const name = sanitize(payload.name, 100);
  const phone = sanitize(payload.phone, 20);
  const email = sanitize(payload.email, 200);
  const message = sanitize(payload.message, 2000);

  if (!name || !message || !PHONE_PATTERN.test(phone)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing or invalid fields" }) };
  }

  await sql`
    insert into contact_messages (name, phone, email, message)
    values (${name}, ${phone}, ${email || null}, ${message})
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
