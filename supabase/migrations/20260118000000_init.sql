-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_verified boolean default false,
  updated_at timestamp with time zone,

  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for skills
create table skills (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  content text, -- Markdown content
  author_id uuid references profiles(id) not null,
  is_official boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for skills
alter table skills enable row level security;

create policy "Skills are viewable by everyone." on skills
  for select using (true);

create policy "Users can insert their own skills." on skills
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own skills." on skills
  for update using (auth.uid() = author_id);

-- Create a table for rules
create table rules (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  content text,
  author_id uuid references profiles(id) not null,
  is_official boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for rules
alter table rules enable row level security;

create policy "Rules are viewable by everyone." on rules
  for select using (true);

create policy "Users can insert their own rules." on rules
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own rules." on rules
  for update using (auth.uid() = author_id);

-- Create a table for workflows
create table workflows (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  content text,
  steps jsonb, -- Structured steps if needed
  author_id uuid references profiles(id) not null,
  is_official boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for workflows
alter table workflows enable row level security;

create policy "Workflows are viewable by everyone." on workflows
  for select using (true);

create policy "Users can insert their own workflows." on workflows
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own workflows." on workflows
  for update using (auth.uid() = author_id);

-- Handle new user signup -> create profile trigger
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'user_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
