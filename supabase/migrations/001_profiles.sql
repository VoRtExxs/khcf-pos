-- Migration: 001_profiles
-- Purpose: Setup user profiles that extend Supabase auth.users

create table public.profiles (
  id uuid references auth.users not null primary key,
  name text not null,
  role text not null default 'VOLUNTEER' check (role in ('ADMIN', 'VOLUNTEER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles disable row level security;
