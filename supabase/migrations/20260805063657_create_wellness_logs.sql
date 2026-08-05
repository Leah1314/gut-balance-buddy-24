-- Create persisted wellness check-ins.
CREATE TABLE IF NOT EXISTS public.wellness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_hours NUMERIC(4, 1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_glasses INTEGER NOT NULL CHECK (water_glasses >= 0 AND water_glasses <= 30),
  exercise_minutes INTEGER NOT NULL CHECK (exercise_minutes >= 0 AND exercise_minutes <= 1440),
  wellness_score INTEGER NOT NULL CHECK (wellness_score >= 0 AND wellness_score <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'Users can view their own wellness logs') THEN
        CREATE POLICY "Users can view their own wellness logs"
          ON public.wellness_logs
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'Users can create their own wellness logs') THEN
        CREATE POLICY "Users can create their own wellness logs"
          ON public.wellness_logs
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'Users can update their own wellness logs') THEN
        CREATE POLICY "Users can update their own wellness logs"
          ON public.wellness_logs
          FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_logs' AND policyname = 'Users can delete their own wellness logs') THEN
        CREATE POLICY "Users can delete their own wellness logs"
          ON public.wellness_logs
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = 'update_wellness_logs_updated_at'
    ) THEN
      CREATE TRIGGER update_wellness_logs_updated_at
        BEFORE UPDATE ON public.wellness_logs
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

REVOKE ALL ON public.wellness_logs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_logs TO authenticated;
