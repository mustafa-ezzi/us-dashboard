-- =========================================================
-- Us Dashboard — Phase 1 schema
-- Paste this into Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: it only seeds when no couple exists yet.
-- =========================================================

-- Couples (your shared "us")
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  anniversary date not null default current_date,
  engagement_date date,
  her_name text not null default 'Her',
  her_emoji text not null default '🌷',
  him_name text not null default 'Him',
  him_emoji text not null default '🐻',
  created_at timestamptz not null default now()
);

-- Couple membership (which user is which partner)
do $$ begin
  create type partner_key as enum ('her', 'him');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.couple_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  partner partner_key not null,
  unique (couple_id, partner)
);

-- Helper: current user's couple_id
create or replace function public.current_couple_id() returns uuid
  language sql stable security definer set search_path = public
  as $$ select couple_id from public.couple_members where user_id = auth.uid() limit 1 $$;

-- Helper: current user's partner key
create or replace function public.current_partner() returns partner_key
  language sql stable security definer set search_path = public
  as $$ select partner from public.couple_members where user_id = auth.uid() limit 1 $$;

-- =========================================================
-- Feature tables
-- =========================================================
alter table public.couple_members
  add column if not exists push_enabled boolean not null default false;

alter table public.couple_members
  add column if not exists daily_reminder_time text not null default '20:00';

alter table public.couple_members
  add column if not exists reminder_timezone text not null default 'Asia/Karachi';

alter table public.couple_members
  add column if not exists last_reminder_date date;

create table if not exists public.planned_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  date_iso date not null,
  time text not null,
  location text not null,
  created_by partner_key not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  response_reason text,
  responded_by partner_key,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

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

create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  partner partner_key not null,
  date_iso date not null,
  score smallint not null check (score between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  unique (couple_id, partner, date_iso)
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  proposed_by partner_key not null,
  title text not null,
  description text,
  status text not null default 'Under Review' check (status in ('Active','Under Review','Retired')),
  created_at timestamptz not null default now()
);

create table if not exists public.violations (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  rule_id uuid not null references public.rules(id) on delete cascade,
  violator partner_key not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.apologies (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  apologizer partner_key not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.immaturity (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.kind_acts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  by_partner partner_key not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.secret_messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  date_iso date not null,
  time text not null,
  created_by partner_key not null,
  note text not null,
  mood text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS
-- =========================================================
alter table public.couples         enable row level security;
alter table public.couple_members  enable row level security;
alter table public.planned_dates   enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.moods           enable row level security;
alter table public.rules           enable row level security;
alter table public.violations      enable row level security;
alter table public.apologies       enable row level security;
alter table public.immaturity      enable row level security;
alter table public.kind_acts       enable row level security;
alter table public.secret_messages enable row level security;

drop policy if exists "members read couple" on public.couples;
create policy "members read couple" on public.couples
  for select using (id = public.current_couple_id());

drop policy if exists "members update couple" on public.couples;
create policy "members update couple" on public.couples
  for update using (id = public.current_couple_id());

drop policy if exists "members read membership" on public.couple_members;
create policy "members read membership" on public.couple_members
  for select using (couple_id = public.current_couple_id());

drop policy if exists "members update own row" on public.couple_members;
create policy "members update own row" on public.couple_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "own push subscriptions" on public.push_subscriptions;
create policy "own push subscriptions" on public.push_subscriptions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Generic helper macro pattern: all feature tables get the same RLS
do $$
declare t text;
begin
  for t in
    select unnest(array['planned_dates','moods','rules','violations','apologies','immaturity','kind_acts'])
  loop
    execute format('drop policy if exists "rw %1$s" on public.%1$s', t);
    execute format(
      'create policy "rw %1$s" on public.%1$s
        for all using (couple_id = public.current_couple_id())
        with check (couple_id = public.current_couple_id())',
      t
    );
  end loop;
end $$;

drop policy if exists "insert own secret messages" on public.secret_messages;
create policy "insert own secret messages" on public.secret_messages
  for insert
  with check (
    couple_id = public.current_couple_id()
    and created_by = public.current_partner()
  );

drop policy if exists "read visible secret messages" on public.secret_messages;
create policy "read visible secret messages" on public.secret_messages
  for select
  using (
    couple_id = public.current_couple_id()
    and (
      created_by = public.current_partner()
      or current_date >= (date_trunc('month', date_iso)::date + interval '1 month')::date
    )
  );

drop policy if exists "delete own secret messages" on public.secret_messages;
create policy "delete own secret messages" on public.secret_messages
  for delete
  using (
    couple_id = public.current_couple_id()
    and created_by = public.current_partner()
  );

create index if not exists secret_messages_couple_date_idx
  on public.secret_messages (couple_id, date_iso desc, time desc);

-- =========================================================
-- Seed couple — edit the two emails below before running.
-- Re-running is safe: it skips if a couple already exists.
-- =========================================================
do $$
declare
  cid uuid;
  mustafa_id uuid;
  ummehani_id uuid;
begin
  if exists (select 1 from public.couples) then
    raise notice 'Couple already exists, skipping seed.';
    return;
  end if;

  select id into mustafa_id  from auth.users where email = 'mustafa@usdash.app';   -- <-- edit if needed
  select id into ummehani_id from auth.users where email = 'ummehani@usdash.app';  -- <-- edit if needed

  if mustafa_id is null or ummehani_id is null then
    raise exception 'Create both users in Authentication first, then re-run this seed block.';
  end if;

  insert into public.couples (anniversary, her_name, her_emoji, him_name, him_emoji)
  values (current_date, 'Ummehani', '🌷', 'Mustafa', '🐻')
  returning id into cid;

  insert into public.couple_members (user_id, couple_id, partner) values
    (ummehani_id, cid, 'her'),
    (mustafa_id,  cid, 'him');
end $$;
