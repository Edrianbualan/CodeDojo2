create table public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(course_id) between 1 and 40),
  item_id text not null check (length(item_id) between 1 and 80),
  last_accessed_at timestamptz not null default now(),
  completed_at timestamptz,
  best_score integer check (best_score between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  xp integer not null default 0 check (xp >= 0),
  primary key (user_id, course_id, item_id)
);

alter table public.academy_progress enable row level security;
revoke all on public.academy_progress from public, anon, authenticated;
grant select on public.academy_progress to authenticated;
create policy academy_read_own on public.academy_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.record_academy_progress(
  p_user uuid, p_course text, p_item text, p_score integer, p_passed boolean, p_xp integer
) returns public.academy_progress
language sql security definer set search_path = ''
as $$
  insert into public.academy_progress as progress (
    user_id, course_id, item_id, best_score, attempts, completed_at, xp
  ) values (
    p_user, p_course, p_item, p_score,
    case when p_score is null then 0 else 1 end,
    case when p_score is not null and p_passed then now() end,
    case when p_score is not null and p_passed then p_xp else 0 end
  )
  on conflict (user_id, course_id, item_id) do update set
    last_accessed_at = now(),
    best_score = greatest(progress.best_score, excluded.best_score),
    attempts = progress.attempts + excluded.attempts,
    xp = case when progress.completed_at is null then excluded.xp else progress.xp end,
    completed_at = coalesce(progress.completed_at, excluded.completed_at)
  returning progress.*;
$$;
revoke all on function public.record_academy_progress(uuid,text,text,integer,boolean,integer)
  from public, anon, authenticated;
grant execute on function public.record_academy_progress(uuid,text,text,integer,boolean,integer)
  to service_role;
