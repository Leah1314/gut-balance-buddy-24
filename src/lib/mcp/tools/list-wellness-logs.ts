import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_wellness_logs",
  title: "List wellness logs",
  description: "List the signed-in user's daily wellness check-ins (sleep, stress, water, exercise), newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(14).describe("How many entries to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;
    const { data, error } = await supabaseForUser(ctx)
      .from("wellness_logs")
      .select("id, sleep_hours, stress_level, water_glasses, exercise_minutes, wellness_score, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 14);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { logs: data ?? [] },
    };
  },
});