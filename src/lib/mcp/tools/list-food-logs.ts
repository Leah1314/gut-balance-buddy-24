import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_food_logs",
  title: "List food logs",
  description: "List the signed-in user's most recent food log entries, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("How many entries to return."),
    since: z.string().optional().describe("Optional ISO date/time; only entries created after it are returned."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, since }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;
    let query = supabaseForUser(ctx)
      .from("food_logs")
      .select("id, food_name, description, created_at, analysis_result")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (since) query = query.gte("created_at", since);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { logs: data ?? [] },
    };
  },
});