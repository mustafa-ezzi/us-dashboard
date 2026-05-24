-- Per-user reminder timezone + dedup — run in Supabase SQL Editor (safe to re-run)

alter table public.couple_members
  add column if not exists reminder_timezone text not null default 'Asia/Karachi';

alter table public.couple_members
  add column if not exists last_reminder_date date;
