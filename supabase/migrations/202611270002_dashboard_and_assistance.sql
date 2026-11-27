alter table public.output_attempts add column if not exists assisted boolean;

-- Earlier clients did not collect this flag per attempt. NULL preserves that distinction.
create or replace function public.record_output_answer_with_assistance(
  p_user uuid, p_attempt uuid, p_question text, p_choice text,
  p_language text, p_difficulty text, p_correct boolean, p_assisted boolean
) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  earned integer;
begin
  earned := public.record_output_answer(p_user, p_attempt, p_question, p_choice, p_language, p_difficulty, p_correct);
  update public.output_attempts
    set assisted = coalesce(assisted, false) or coalesce(p_assisted, false)
    where user_id = p_user and id = p_attempt;
  return earned;
end;
$$;
revoke all on function public.record_output_answer_with_assistance(uuid, uuid, text, text, text, text, boolean, boolean)
  from public, anon, authenticated;
grant execute on function public.record_output_answer_with_assistance(uuid, uuid, text, text, text, text, boolean, boolean)
  to service_role;

create index if not exists output_attempts_user_date on public.output_attempts (user_id, created_at desc);
create index if not exists training_summaries_user_date on public.training_summaries (user_id, created_at desc);

create or replace function public.learning_dashboard()
returns jsonb language sql stable security invoker set search_path = ''
as $$
with today as (
  select (now() at time zone 'UTC')::date as day
), attempt_days as (
  select (created_at at time zone 'UTC')::date as day, count(*) as total
  from public.output_attempts
  where user_id = (select auth.uid())
  group by 1
), consecutive as (
  select day, row_number() over (order by day desc)::int as position from attempt_days
  where day <= (select day from today)
), streak_lengths as (
  select count(*) as length from consecutive group by day + position
), bucket as (
  select language, difficulty, count(distinct question_id) as completed
  from public.output_attempts
  where user_id = (select auth.uid()) and correct
  group by language, difficulty
), totals as (
  select count(*) as attempts, count(*) filter (where correct) as correct,
    count(*) filter (where assisted) as assisted,
    count(*) filter (where assisted is null) as unclassified
  from public.output_attempts where user_id = (select auth.uid())
), sessions as (
  select language, difficulty, correct, wrong_attempts, skipped, assisted, elapsed_seconds, created_at, session_id
  from public.training_summaries where user_id = (select auth.uid())
  order by created_at desc, session_id desc limit 7
)
select jsonb_build_object(
  'totals', (select to_jsonb(totals) from totals),
  'xp', (select coalesce(sum(amount), 0) from public.output_xp where user_id = (select auth.uid())),
  'completion', coalesce((select jsonb_agg(to_jsonb(bucket)) from bucket), '[]'::jsonb),
  'seconds', (select coalesce(sum(elapsed_seconds), 0) from public.training_summaries where user_id = (select auth.uid())),
  'sessions', coalesce((select jsonb_agg(to_jsonb(sessions) order by created_at desc, session_id desc) from sessions), '[]'::jsonb),
  'week', (select jsonb_agg(jsonb_build_object('day', today.day - n, 'total', coalesce(a.total, 0)) order by n desc)
    from today cross join generate_series(0, 6) n left join attempt_days a on a.day = today.day - n),
  'streak', (select count(*) from consecutive, today
    where (select max(day) from attempt_days) >= today.day - 1
      and consecutive.day + consecutive.position = (select max(day) + 1 from attempt_days)),
  'best_streak', (select coalesce(max(length), 0) from streak_lengths)
);
$$;
revoke all on function public.learning_dashboard() from public, anon;
grant execute on function public.learning_dashboard() to authenticated;
