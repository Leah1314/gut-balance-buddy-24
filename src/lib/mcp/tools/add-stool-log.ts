import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_stool_log",
  title: "Add stool log",
  description: "Record a stool entry for the signed-in user.",
  inputSchema: {
    bristol_type: z.number().int().min(1).max(7).optional().describe("Bristol stool scale type, 1-7."),
    color: z.string().trim().optional().describe("Colour, e.g. brown, green, black."),
    consistency: z.string().trim().optional().describe("Consistency description."),
    notes: z.string().trim().optional().describe("Optional notes."),
    created_at: z.string().optional().describe("Optional ISO timestamp for backdated entries."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ bristol_type, color, consistency, notes, created_at }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;
    const { data, error } = await supabaseForUser(ctx)
      .from("stool_logs")
      .insert({
        user_id: ctx.getUserId(),
        bristol_type,
        color,
        consistency,
        notes,
        ...(created_at ? { created_at } : {}),
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { log: data } };
  },
});