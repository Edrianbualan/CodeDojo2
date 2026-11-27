create table public.training_summaries (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  language text not null check (language in ('Python', 'JavaScript')),
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  correct integer not null check (correct >= 0),
  wrong_attempts integer not null check (wrong_attempts >= 0),
  skipped integer not null check (skipped >= 0),
  assisted integer not null check (assisted >= 0),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

alter table public.training_summaries enable row level security;
revoke all on public.training_summaries from anon, authenticated;
grant select, insert on public.training_summaries to authenticated;

create policy training_summaries_read on public.training_summaries
  for select to authenticated using ((select auth.uid()) = user_id);

create policy training_summaries_insert on public.training_summaries
  for insert to authenticated with check ((select auth.uid()) = user_id);
