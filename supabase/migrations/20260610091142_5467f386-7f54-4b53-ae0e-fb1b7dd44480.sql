
-- 1. Lock down SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Set fixed search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Revoke anon access on user-private tables (RLS already protects authenticated)
REVOKE ALL ON public.food_logs FROM anon;
REVOKE ALL ON public.stool_logs FROM anon;
REVOKE ALL ON public.test_results FROM anon;
REVOKE ALL ON public.user_health_profiles FROM anon;
REVOKE ALL ON public.profiles FROM anon;
