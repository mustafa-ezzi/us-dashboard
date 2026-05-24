-- Date plan accept/reject — run in Supabase SQL Editor (safe to re-run)

alter table public.planned_dates
  add column if not exists status text not null default 'accepted'
    check (status in ('pending', 'accepted', 'rejected'));

alter table public.planned_dates
  alter column status set default 'pending';

alter table public.planned_dates
  add column if not exists response_reason text;

alter table public.planned_dates
  add column if not exists responded_by partner_key;

alter table public.planned_dates
  add column if not exists responded_at timestamptz;

-- If column was added earlier with default 'pending', backfill legacy rows once.
update public.planned_dates
set status = 'accepted'
where status = 'pending'
  and responded_at is null
  and responded_by is null;
