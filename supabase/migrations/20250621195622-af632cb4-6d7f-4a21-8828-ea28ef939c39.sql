
-- Add user_id column to user_health_profiles if it doesn't exist and make it NOT NULL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_health_profiles' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.user_health_profiles ADD COLUMN user_id UUID REFERENCES auth.users NOT NULL;
    ELSE
        -- Make user_id NOT NULL if it exists but is nullable
        ALTER TABLE public.user_health_profiles ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Create RLS policies for health profiles (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_health_profiles' AND policyname = 'Users can view their own health profile') THEN
        CREATE POLICY "Users can view their own health profile" 
          ON public.user_health_profiles 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_health_profiles' AND policyname = 'Users can create their own health profile') THEN
        CREATE POLICY "Users can create their own health profile" 
          ON public.user_health_profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_health_profiles' AND policyname = 'Users can update their own health profile') THEN
        CREATE POLICY "Users can update their own health profile" 
          ON public.user_health_profiles 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_health_profiles' AND policyname = 'Users can delete their own health profile') THEN
        CREATE POLICY "Users can delete their own health profile" 
          ON public.user_health_profiles 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create tables for tracking data with user association
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  food_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stool_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bristol_type INTEGER,
  color TEXT,
  consistency TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stool_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food logs
CREATE POLICY "Users can view their own food logs" 
  ON public.food_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food logs" 
  ON public.food_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food logs" 
  ON public.food_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food logs" 
  ON public.food_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for stool logs
CREATE POLICY "Users can view their own stool logs" 
  ON public.stool_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stool logs" 
  ON public.stool_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stool logs" 
  ON public.stool_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stool logs" 
  ON public.stool_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);
