-- Migration to remove all public/anonymous RLS policies
-- Goal: Restrict direct database access via the anon key and shift to server-side access via the service role.

-- Skills
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON skills;
DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
DROP POLICY IF EXISTS "Skills are viewable by everyone." ON skills;

-- Workflows
DROP POLICY IF EXISTS "Authenticated users can insert workflows" ON workflows;
DROP POLICY IF EXISTS "Users can insert their own workflows." ON workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows." ON workflows;
DROP POLICY IF EXISTS "Workflows are viewable by everyone" ON workflows;
DROP POLICY IF EXISTS "Workflows are viewable by everyone." ON workflows;

-- Rules
DROP POLICY IF EXISTS "Authenticated users can insert rules" ON rules;
DROP POLICY IF EXISTS "Rules are viewable by everyone" ON rules;
DROP POLICY IF EXISTS "Rules are viewable by everyone." ON rules;
DROP POLICY IF EXISTS "Users can update own rules" ON rules;
DROP POLICY IF EXISTS "Users can update their own rules." ON rules;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Public can view minimal profile info of authors." ON profiles;

-- Ensure RLS is enabled on all tables (it should be, but let's be safe)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
