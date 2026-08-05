import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listFoodLogs from "./tools/list-food-logs";
import addFoodLog from "./tools/add-food-log";
import listStoolLogs from "./tools/list-stool-logs";
import addStoolLog from "./tools/add-stool-log";
import listWellnessLogs from "./tools/list-wellness-logs";
import getHealthProfile from "./tools/get-health-profile";
import listTestResults from "./tools/list-test-results";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gutlyhealth",
  title: "gutlyhealth",
  version: "0.1.0",
  instructions:
    "Tools for Gutly, a gut health tracker. Read and add the signed-in user's food logs, stool logs, and wellness check-ins, and read their health profile and lab test summaries. Use this data to answer questions about digestive patterns; it is personal health data, so never share it outside the conversation.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listFoodLogs,
    addFoodLog,
    listStoolLogs,
    addStoolLog,
    listWellnessLogs,
    getHealthProfile,
    listTestResults,
  ],
});