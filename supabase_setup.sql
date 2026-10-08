-- BUMATECH MULTI-SCHOOL SETUP
-- Run this entire script in Supabase SQL Editor.
-- It assumes Supabase Auth is enabled.

create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  code text not null unique,
  knec_code text,
  school_type text,
  county text,
  sub_county text,
  category text,
  attendance_type text,
  motto text,
  logo_url text,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.school_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  academic_year integer not null,
  stream_count integer not null default 1,
  created_at timestamptz not null default now(),
  unique(school_id,name,academic_year)
);

create table if not exists public.school_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(school_id,name)
);

create table if not exists public.school_settings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references public.schools(id) on delete cascade,
  assessment_system text default 'CBC / CBE',
  grading_scale text default 'Kenya CBC',
  terms_per_year integer default 3,
  lessons_per_day integer default 13,
  start_time time default '07:30',
  end_time time default '16:30',
  enable_timetable boolean default true,
  enable_sms boolean default false,
  currency text default 'KES',
  fees_mode text default 'Enabled',
  parent_portal text default 'Enabled',
  boarding_mode text default 'Disabled',
  created_at timestamptz not null default now()
);

create table if not exists public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'Teacher',
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  unique(school_id,user_id)
);

create index if not exists school_classes_school_id_idx on public.school_classes(school_id);
create index if not exists school_subjects_school_id_idx on public.school_subjects(school_id);
create index if not exists school_members_school_id_idx on public.school_members(school_id);
create index if not exists school_members_user_id_idx on public.school_members(user_id);

alter table public.schools enable row level security;
alter table public.school_classes enable row level security;
alter table public.school_subjects enable row level security;
alter table public.school_settings enable row level security;
alter table public.school_members enable row level security;

-- Helper: a logged-in user can access a school if they are a member.
create or replace function public.is_school_member(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.school_members
    where school_id = p_school_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_school_owner(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.schools
    where id = p_school_id and owner_id = auth.uid()
  );
$$;

-- Schools: owner can create/read/update their own school.
drop policy if exists "school owner insert" on public.schools;
create policy "school owner insert" on public.schools for insert
with check (owner_id = auth.uid());

drop policy if exists "school members read school" on public.schools;
create policy "school members read school" on public.schools for select
using (owner_id = auth.uid() or public.is_school_member(id));

drop policy if exists "school owner update" on public.schools;
create policy "school owner update" on public.schools for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Classes
drop policy if exists "members read classes" on public.school_classes;
create policy "members read classes" on public.school_classes for select
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members insert classes" on public.school_classes;
create policy "members insert classes" on public.school_classes for insert
with check (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members update classes" on public.school_classes;
create policy "members update classes" on public.school_classes for update
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members delete classes" on public.school_classes;
create policy "members delete classes" on public.school_classes for delete
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

-- Subjects
drop policy if exists "members read subjects" on public.school_subjects;
create policy "members read subjects" on public.school_subjects for select
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members insert subjects" on public.school_subjects;
create policy "members insert subjects" on public.school_subjects for insert
with check (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members update subjects" on public.school_subjects;
create policy "members update subjects" on public.school_subjects for update
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

-- Settings
drop policy if exists "members read settings" on public.school_settings;
create policy "members read settings" on public.school_settings for select
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members insert settings" on public.school_settings;
create policy "members insert settings" on public.school_settings for insert
with check (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "members update settings" on public.school_settings;
create policy "members update settings" on public.school_settings for update
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

-- Members: a user can see members in schools they belong to.
drop policy if exists "members read members" on public.school_members;
create policy "members read members" on public.school_members for select
using (public.is_school_member(school_id) or public.is_school_owner(school_id));

drop policy if exists "owner insert member" on public.school_members;
create policy "owner insert member" on public.school_members for insert
with check (public.is_school_owner(school_id) or user_id = auth.uid());

drop policy if exists "owner update member" on public.school_members;
create policy "owner update member" on public.school_members for update
using (public.is_school_owner(school_id));

-- Optional storage bucket for school logos.
insert into storage.buckets (id, name, public)
values ('school-logos','school-logos',true)
on conflict (id) do nothing;

drop policy if exists "school logo upload" on storage.objects;
create policy "school logo upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'school-logos');

drop policy if exists "school logo public read" on storage.objects;
create policy "school logo public read" on storage.objects
for select
using (bucket_id = 'school-logos');
