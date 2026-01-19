-- Migration to restore public SELECT access
-- Goal: Allow unauthenticated users to browse skills, profiles, workflows, and rules.

-- Skills: allow anyone to browse
CREATE POLICY "Skills are viewable by everyone" ON public.skills
  FOR SELECT USING (true);

-- Profiles: allow anyone to view author details
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Workflows: allow anyone to browse
CREATE POLICY "Workflows are viewable by everyone" ON public.workflows
  FOR SELECT USING (true);

-- Rules: allow anyone to browse
CREATE POLICY "Rules are viewable by everyone" ON public.rules
  FOR SELECT USING (true);
