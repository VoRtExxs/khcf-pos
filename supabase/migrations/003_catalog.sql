-- Migration: 003_catalog
-- Purpose: Categories and Items

drop table if exists public.items cascade;
drop table if exists public.categories cascade;

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique
);

create table public.items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category_id uuid references public.categories(id) not null,
  subcategory varchar(255),
  price numeric not null,
  img_url text
);

alter table public.categories disable row level security;
alter table public.items disable row level security;
