-- Secret messages unlock for the partner on the first day of the next month.

create table if not exists public.secret_messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  date_iso date not null,
  time text not null,
  created_by partner_key not null,
  note text not null,
  mood text not null,
  voice_url text,
  created_at timestamptz not null default now()
);

alter table public.secret_messages
  add column if not exists voice_url text;

alter table public.secret_messages enable row level security;

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

insert into storage.buckets (id, name, public)
values ('secret-voice-notes', 'secret-voice-notes', true)
on conflict (id) do nothing;

drop policy if exists "secret_voice_notes_upload" on storage.objects;
create policy "secret_voice_notes_upload" on storage.objects for insert
  with check (
    bucket_id = 'secret-voice-notes'
    and auth.role() = 'authenticated'
  );

drop policy if exists "secret_voice_notes_read" on storage.objects;
create policy "secret_voice_notes_read" on storage.objects for select
  using (bucket_id = 'secret-voice-notes');

drop policy if exists "secret_voice_notes_delete" on storage.objects;
create policy "secret_voice_notes_delete" on storage.objects for delete
  using (
    bucket_id = 'secret-voice-notes'
    and auth.role() = 'authenticated'
  );
