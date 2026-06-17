-- supabase_schema.sql
-- Paste this in your Supabase SQL Editor to drop old tables, recreate them, and disable Row Level Security (RLS)

-- 1. Drop old tables in reverse dependency order
drop table if exists public.notifications cascade;
drop table if exists public.task_attachments cascade;
drop table if exists public.task_comments cascade;
drop table if exists public.tasks cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- 2. Profiles Table (Manually Authenticated)
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null unique,
  password text not null,
  role text check (role in ('Super Admin', 'Admin', 'User')) default 'User',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text check (status in ('Planning', 'Active', 'On Hold', 'Completed')) default 'Active',
  created_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint projects_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null
);

-- 4. Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null,
  title text not null,
  description text,
  assigned_to uuid,
  assigned_by uuid,
  priority text check (priority in ('Low', 'Medium', 'High', 'Critical')) default 'Medium',
  status text check (status in ('Pending', 'In Progress', 'Review', 'Completed')) default 'Pending',
  progress integer check (progress >= 0 and progress <= 100) default 0,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint tasks_project_id_fkey foreign key (project_id) references public.projects(id) on delete cascade,
  constraint tasks_assigned_to_fkey foreign key (assigned_to) references public.profiles(id) on delete set null,
  constraint tasks_assigned_by_fkey foreign key (assigned_by) references public.profiles(id) on delete set null
);

-- 5. Task Comments Table
create table public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null,
  user_id uuid not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint task_comments_task_id_fkey foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint task_comments_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade
);

-- 6. Task Attachments Table
create table public.task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null,
  uploaded_by uuid not null,
  file_url text not null,
  file_name text not null,
  file_size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint task_attachments_task_id_fkey foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint task_attachments_uploaded_by_fkey foreign key (uploaded_by) references public.profiles(id) on delete cascade
);

-- 7. Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint notifications_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade
);

-- 8. Disable Row Level Security (RLS) on all tables to allow direct DB Auth
alter table public.profiles disable row level security;
alter table public.projects disable row level security;
alter table public.tasks disable row level security;
alter table public.task_comments disable row level security;
alter table public.task_attachments disable row level security;
alter table public.notifications disable row level security;


-- 9. Setup Storage Bucket and Policies via SQL
-- Create bucket
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', true)
on conflict (id) do nothing;

-- Create Policies for storage objects inside 'task-attachments'
drop policy if exists "Allow public select on task-attachments" on storage.objects;
drop policy if exists "Allow public insert on task-attachments" on storage.objects;
drop policy if exists "Allow public delete on task-attachments" on storage.objects;

-- Select policy (Allow everyone to view files)
create policy "Allow public select on task-attachments"
on storage.objects for select
to public
using (bucket_id = 'task-attachments');

-- Insert policy (Allow public users to upload files)
create policy "Allow public insert on task-attachments"
on storage.objects for insert
to public
with check (bucket_id = 'task-attachments');

-- Delete policy (Allow public users to delete files)
create policy "Allow public delete on task-attachments"
on storage.objects for delete
to public
using (bucket_id = 'task-attachments');

