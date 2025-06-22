
-- Create table to store analyzed test results
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  test_type TEXT,
  key_findings TEXT[],
  test_values JSONB,
  recommendations TEXT[],
  concern_level TEXT,
  summary TEXT,
  raw_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for test results
CREATE POLICY "Users can view their own test results" 
  ON public.test_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" 
  ON public.test_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results" 
  ON public.test_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test results" 
  ON public.test_results 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update the user_health_profiles table to include a reference to recent test results
ALTER TABLE public.user_health_profiles 
ADD COLUMN IF NOT EXISTS latest_test_results_id UUID REFERENCES public.test_results(id);
