-- Add audit logs table for platform security (airport compliance)
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Only admins can view logs (for now, allow authenticated users to insert)
create policy "Users can insert audit logs" on audit_logs
  for insert with check (auth.uid() = user_id);

create policy "Admins can view audit logs" on audit_logs
  for select using (auth.role() = 'authenticated'); -- Placeholder for admin role