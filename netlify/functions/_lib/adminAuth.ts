import type { HandlerEvent } from "@netlify/functions";
import { requireAuth } from "./auth";

/**
 * Admin status is an env-var allowlist (ADMIN_USER_IDS, comma-separated Clerk
 * user ids) rather than a DB column — avoids a chicken-and-egg problem where
 * the users table row only exists after a first authenticated request.
 */
export async function requireAdmin(event: HandlerEvent): Promise<string | null> {
  const userId = await requireAuth(event);
  if (!userId) {
    return null;
  }

  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return adminIds.includes(userId) ? userId : null;
}
