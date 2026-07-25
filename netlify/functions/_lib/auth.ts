import { verifyToken } from "@clerk/backend";
import type { HandlerEvent } from "@netlify/functions";

/** Returns the Clerk user id (sub claim) for a valid Bearer session token, or null. */
export async function requireAuth(event: HandlerEvent): Promise<string | null> {
  const authHeader = event.headers.authorization ?? event.headers.Authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return null;
  }

  try {
    const { sub } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    return sub;
  } catch {
    return null;
  }
}
