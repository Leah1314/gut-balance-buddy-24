
-- Create user health profiles table for storing dietary restrictions and health data
CREATE TABLE public.user_health_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Dietary restrictions
  dietary_restrictions JSONB DEFAULT '{}',
  custom_restrictions TEXT,
  
  -- Personal metrics
  age INTEGER,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  
  -- Medical information
  medical_conditions TEXT[],
  medications TEXT[],
  recent_tests JSONB DEFAULT '[]',
  symptoms_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user health profiles
CREATE POLICY "Users can view their own health profile" 
  ON public.user_health_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health profile" 
  ON public.user_health_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile" 
  ON public.user_health_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health profile" 
  ON public.user_health_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique index to ensure one profile per user
CREATE UNIQUE INDEX user_health_profiles_user_id_unique 
  ON public.user_health_profiles (user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_health_profiles_updated_at 
  BEFORE UPDATE ON public.user_health_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
