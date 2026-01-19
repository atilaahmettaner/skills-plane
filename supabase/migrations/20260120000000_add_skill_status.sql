-- Add status column to skills for approval process (manufacturing compliance)
alter table skills add column status text default 'draft' check (status in ('draft', 'pending', 'approved'));

-- Update existing skills to approved if official
update skills set status = 'approved' where is_official = true;

-- Add policy for approval (only verified users can approve?)
-- For now, allow admins or something, but keep simple