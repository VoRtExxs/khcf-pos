-- Migration: 004_transactions
-- Purpose: Store sales and items sold

drop table if exists public.transaction_items cascade;
drop table if exists public.transactions cascade;

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  volunteer_name text not null,
  site_name text not null,
  payment_method text not null check (payment_method in ('CASH', 'VISA')),
  visa_last4 text,
  total_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.transaction_items (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions(id) not null,
  item_id uuid references public.items(id) not null,
  quantity integer not null default 1,
  price_at_time numeric not null
);

alter table public.transactions disable row level security;
alter table public.transaction_items disable row level security;
