-- Seed Data for Skills Plane

-- 1. Create Official Vercel Profile
-- Note: Replace with actual official UUID if needed, but for now we keep it generic
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d001', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'labs@vercel.com', 
    '$2a$10$NotARealHashButItDoesntMatterForMockData', 
    now(), 
    '{"full_name": "Vercel Labs", "user_name": "vercel-labs", "avatar_url": "https://vercel.com/api/www/avatar/vercel-labs?s=64"}', 
    now(), 
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Update Profile
UPDATE public.profiles 
SET is_verified = true, 
    website = 'https://vercel.com/labs',
    type = 'organization'
WHERE id = 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d001';

-- 3. Insert Vercel Agent Skills
INSERT INTO public.skills (slug, title, description, content, github_url, author_id, is_official)
VALUES
  (
    'agent-skills', 
    'Agent Skills', 
    'A collection of skills for AI agents, enabling them to handle common development tasks.', 
    NULL, -- Content will be fetched from GitHub
    'https://github.com/vercel-labs/agent-skills', 
    'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d001', 
    true
  )
ON CONFLICT (slug) DO NOTHING;
