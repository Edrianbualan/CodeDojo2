create table public.output_attempts (
  id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (char_length(question_id) <= 64),
  choice text not null check (char_length(choice) <= 12),
  language text not null check (language in ('Python', 'JavaScript')),
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  correct boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.output_xp (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  attempt_id uuid not null,
  amount integer not null check (amount in (5, 10, 15, 20)),
  created_at timestamptz not null default now(),
  primary key (user_id, question_id),
  foreign key (user_id, attempt_id) references public.output_attempts(user_id, id) on delete cascade
);

alter table public.output_attempts enable row level security;
alter table public.output_xp enable row level security;
revoke all on public.output_attempts, public.output_xp from anon, authenticated;
grant select on public.output_attempts, public.output_xp to authenticated;
create policy output_attempts_read on public.output_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy output_xp_read on public.output_xp for select to authenticated using ((select auth.uid()) = user_id);

create function public.record_output_answer(
  p_user uuid, p_attempt uuid, p_question text, p_choice text,
  p_language text, p_difficulty text, p_correct boolean
) returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  awarded integer;
begin
  insert into public.output_attempts (user_id, id, question_id, choice, language, difficulty, correct)
  values (p_user, p_attempt, p_question, p_choice, p_language, p_difficulty, p_correct)
  on conflict (user_id, id) do nothing;

  if not found then
    if not exists (
      select 1 from public.output_attempts
      where user_id = p_user and id = p_attempt and question_id = p_question and choice = p_choice
        and language = p_language and difficulty = p_difficulty and correct = p_correct
    ) then
      raise exception 'Attempt ID has already been used';
    end if;
    select amount into awarded from public.output_xp where user_id = p_user and attempt_id = p_attempt;
    return coalesce(awarded, 0);
  end if;

  if p_correct then
    insert into public.output_xp (user_id, question_id, attempt_id, amount)
    values (p_user, p_question, p_attempt, case p_difficulty
      when 'Beginner' then 5 when 'Intermediate' then 10 when 'Advanced' then 15 when 'Expert' then 20 end)
    on conflict (user_id, question_id) do nothing
    returning amount into awarded;
  end if;

  return coalesce(awarded, 0);
end;
$$;

revoke all on function public.record_output_answer(uuid, uuid, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.record_output_answer(uuid, uuid, text, text, text, text, boolean) to service_role;

create function public.output_progress()
returns table (language text, difficulty text, attempts bigint, correct bigint, xp bigint)
language sql stable security invoker
set search_path = ''
as $$
  select a.language, a.difficulty, count(*), count(*) filter (where a.correct), coalesce(sum(x.amount), 0)
  from public.output_attempts a
  left join public.output_xp x on x.user_id = a.user_id and x.question_id = a.question_id and x.attempt_id = a.id
  where a.user_id = (select auth.uid())
  group by a.language, a.difficulty
  order by a.language, case a.difficulty
    when 'Beginner' then 1 when 'Intermediate' then 2 when 'Advanced' then 3 when 'Expert' then 4 end;
$$;

revoke all on function public.output_progress() from public, anon;
grant execute on function public.output_progress() to authenticated;
