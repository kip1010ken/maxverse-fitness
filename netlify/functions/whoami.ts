import { requireAdmin } from "./_lib/adminAuth";
import { withErrorHandling } from "./_lib/withHandler";

export const handler = withErrorHandling(async (event) => {
  const adminId = await requireAdmin(event);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAdmin: Boolean(adminId) }),
  };
});
