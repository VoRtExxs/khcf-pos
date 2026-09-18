-- Migration: 002_sites
-- Purpose: Setup site management and volunteer requests

create table public.sites (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.site_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  site_id uuid references public.sites(id) not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sites disable row level security;
alter table public.site_requests disable row level security;
