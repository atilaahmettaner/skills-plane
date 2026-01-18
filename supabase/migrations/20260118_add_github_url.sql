-- Add github_url column to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_skills_github_url ON skills(github_url);
