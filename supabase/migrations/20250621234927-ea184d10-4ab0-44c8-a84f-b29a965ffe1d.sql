
-- Check if policies exist and create only missing ones for food_logs
DO $$ 
BEGIN
    -- Food logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can view their own food logs') THEN
        CREATE POLICY "Users can view their own food logs" 
          ON public.food_logs 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can create their own food logs') THEN
        CREATE POLICY "Users can create their own food logs" 
          ON public.food_logs 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can update their own food logs') THEN
        CREATE POLICY "Users can update their own food logs" 
          ON public.food_logs 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_logs' AND policyname = 'Users can delete their own food logs') THEN
        CREATE POLICY "Users can delete their own food logs" 
          ON public.food_logs 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Stool logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stool_logs' AND policyname = 'Users can view their own stool logs') THEN
        CREATE POLICY "Users can view their own stool logs" 
          ON public.stool_logs 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stool_logs' AND policyname = 'Users can create their own stool logs') THEN
        CREATE POLICY "Users can create their own stool logs" 
          ON public.stool_logs 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stool_logs' AND policyname = 'Users can update their own stool logs') THEN
        CREATE POLICY "Users can update their own stool logs" 
          ON public.stool_logs 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stool_logs' AND policyname = 'Users can delete their own stool logs') THEN
        CREATE POLICY "Users can delete their own stool logs" 
          ON public.stool_logs 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;
