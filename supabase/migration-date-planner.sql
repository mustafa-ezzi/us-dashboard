-- Run this in Supabase SQL Editor if you already ran the original schema.
-- Adds Date Planner + Engagement date. Safe to re-run.

alter table public.couples
  add column if not exists engagement_date date;

create table if not exists public.planned_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  date_iso date not null,
  time text not null,
  location text not null,
  created_by partner_key not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.planned_dates enable row level security;

drop policy if exists "rw planned_dates" on public.planned_dates;
create policy "rw planned_dates" on public.planned_dates
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());
