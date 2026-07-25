import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

/**
 * Every function is wrapped in this so an unhandled DB/network error returns
 * a clean 500 instead of leaking a stack trace or raw driver error to the
 * client, while still logging the real error server-side for debugging.
 */
export function withErrorHandling(
  fn: (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>
): Handler {
  return async (event, context) => {
    try {
      return await fn(event, context);
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  };
}
