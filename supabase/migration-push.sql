-- PWA Push notifications — run in Supabase SQL Editor (safe to re-run)

alter table public.couple_members
  add column if not exists push_enabled boolean not null default false;

alter table public.couple_members
  add column if not exists daily_reminder_time text not null default '20:00';

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now(),
  unique (endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "own push subscriptions" on public.push_subscriptions;
create policy "own push subscriptions" on public.push_subscriptions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Server (service role) reads all subs for sending — no extra policy needed.
