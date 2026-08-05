import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WellnessLog {
  id: string;
  user_id: string;
  stress_level: number;
  sleep_hours: number;
  water_glasses: number;
  exercise_minutes: number;
  wellness_score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useWellnessLogs = () => {
  const { user } = useAuth();
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWellnessLogs = async () => {
    if (!user) {
      setWellnessLogs([]);
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wellness_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const logs = data || [];
      setWellnessLogs(logs);
      return logs;
    } catch (error) {
      console.error("Error fetching wellness logs:", error);
      toast.error("Failed to load wellness logs");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addWellnessLog = async (input: {
    stress_level: number;
    sleep_hours: number;
    water_glasses: number;
    exercise_minutes: number;
    wellness_score: number;
    notes?: string | null;
  }) => {
    if (!user) {
      toast.error("You must be logged in to save wellness check-ins");
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wellness_logs")
        .insert({
          user_id: user.id,
          ...input,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchWellnessLogs();
      toast.success("Wellness check-in saved");
      return data;
    } catch (error) {
      console.error("Error saving wellness log:", error);
      toast.error("Failed to save wellness check-in");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellnessLogs();
  }, [user]);

  return {
    wellnessLogs,
    loading,
    addWellnessLog,
    refreshWellnessLogs: fetchWellnessLogs,
  };
};
