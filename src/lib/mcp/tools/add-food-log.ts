import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_food_log",
  title: "Add food log",
  description: "Record a meal or food item for the signed-in user.",
  inputSchema: {
    food_name: z.string().trim().min(1).describe("Name of the meal or food item."),
    description: z.string().trim().optional().describe("Optional notes about the meal."),
    created_at: z.string().optional().describe("Optional ISO timestamp for backdated entries."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ food_name, description, created_at }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;
    const { data, error } = await supabaseForUser(ctx)
      .from("food_logs")
      .insert({ user_id: ctx.getUserId(), food_name, description, ...(created_at ? { created_at } : {}) })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { log: data } };
  },
});