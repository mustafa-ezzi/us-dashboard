-- =========================================================
-- Health Score & Reports Tables
-- For weekly health score computation and report generation
-- =========================================================

-- Weekly relationship health scores
create table if not exists public.weekly_health_scores (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  week_start_date date not null,
  overall_score smallint not null check (overall_score between 0 and 100),
  mood_avg_score numeric not null check (mood_avg_score between 1 and 5),
  mood_sync_percentage smallint not null check (mood_sync_percentage between 0 and 100),
  kind_acts_count smallint not null default 0,
  violations_count smallint not null default 0,
  check_in_streak_days smallint not null default 0,
  completed_tasks_count smallint,
  engagement_level text not null check (engagement_level in ('low', 'medium', 'high')),
  notes text,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (couple_id, week_start_date)
);

-- Reports (weekly, monthly, yearly)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  report_type text not null check (report_type in ('weekly', 'monthly', 'yearly')),
  period_start_date date not null,
  period_end_date date not null,
  title text,
  summary text,
  key_metrics jsonb,  -- Stores computed metrics as JSON
  highlights jsonb,   -- Top moments, milestones
  insights text,
  health_scores_avg smallint,
  created_at timestamptz not null default now(),
  unique (couple_id, report_type, period_start_date)
);

-- Report snapshots (for archived yearly reports)
create table if not exists public.report_archives (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  year smallint not null,
  full_report jsonb not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS Policies
-- =========================================================
alter table public.weekly_health_scores enable row level security;
alter table public.reports enable row level security;
alter table public.report_archives enable row level security;

drop policy if exists "rw weekly_health_scores" on public.weekly_health_scores;
create policy "rw weekly_health_scores" on public.weekly_health_scores
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "rw reports" on public.reports;
create policy "rw reports" on public.reports
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

drop policy if exists "rw report_archives" on public.report_archives;
create policy "rw report_archives" on public.report_archives
  for all using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

-- =========================================================
-- Indexes for performance
-- =========================================================
create index if not exists idx_health_scores_couple_week on public.weekly_health_scores(couple_id, week_start_date);
create index if not exists idx_reports_couple_type on public.reports(couple_id, report_type);
create index if not exists idx_archives_couple_year on public.report_archives(couple_id, year);
