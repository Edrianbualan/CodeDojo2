create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  experience text not null check (experience in (
    'Complete beginner', 'First-year student', 'Second-year student', 'Third-year student',
    'Fourth-year student', 'Intermediate programmer', 'Advanced programmer', 'Professional developer'
  )),
  preferences text[] not null check (
    cardinality(preferences) between 1 and 9
    and array_position(preferences, null) is null
    and preferences <@ array['C', 'C++', 'Java', 'Python', 'JavaScript', 'HTML', 'CSS', 'PHP', 'SQL']
  ),
  goal text not null check (goal in (
    'Learn programming fundamentals', 'Improve coding fluency',
    'Prepare for interviews', 'Practice algorithms', 'Build projects'
  )),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, username, experience, preferences, goal) on public.profiles to authenticated;
grant update (id, username, experience, preferences, goal) on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
