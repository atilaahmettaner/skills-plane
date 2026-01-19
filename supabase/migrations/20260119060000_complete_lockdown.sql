-- Final Lockdown Migration: Zero Policies
-- This ensures that no data can be read or written directly via PostgREST (Supabase API) using the anon key.

-- Drop ALL SELECT policies
DROP POLICY IF EXISTS "Skills are viewable by everyone" ON public.skills;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Workflows are viewable by everyone" ON public.workflows;
DROP POLICY IF EXISTS "Rules are viewable by everyone" ON public.rules;

-- Drop any remaining policies just in case (Auth/Author specific)
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public can view minimal profile info of authors." ON public.profiles;

-- Ensure RLS is enabled (Default behavior with no policies is DENY ALL)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
