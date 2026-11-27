import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
const first = "00000000-0000-4000-8000-000000000003";
const next = "00000000-0000-4000-8000-000000000004";
const migrations = [
  "202611260001_profiles.sql",
  "202611260002_output_progress.sql",
  "202611270001_training_summaries.sql",
  "202611270002_dashboard_and_assistance.sql",
  "202611270003_academy.sql",
];

test("profile and output migrations enforce ownership and idempotent XP", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role;
      create schema auth;
      create table auth.users(id uuid primary key);
      insert into auth.users values ('${alice}'), ('${bob}');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
    `);
    for (const migration of migrations) {
      await db.exec(
        await readFile(
          new URL(`../supabase/migrations/${migration}`, import.meta.url),
          "utf8",
        ),
      );
    }
    const record = (user, attempt, choice = "8", correct = true) =>
      db.query(
        "select public.record_output_answer($1, $2, 'python-0-0-0', $3, 'Python', 'Beginner', $4) as xp",
        [user, attempt, choice, correct],
      );
    await db.exec("set role service_role");
    assert.equal((await record(alice, first)).rows[0].xp, 5);
    assert.equal((await record(alice, first)).rows[0].xp, 5);
    await assert.rejects(record(alice, first, "9", false), /Attempt ID/);
    assert.equal((await record(alice, next)).rows[0].xp, 0);
    assert.equal((await record(bob, first, "9", false)).rows[0].xp, 0);
    const assisted = await db.query(
      "select public.record_output_answer_with_assistance($1, $2, 'python-0-0-0', '8', 'Python', 'Beginner', true, true) as xp",
      [alice, next],
    );
    assert.equal(assisted.rows[0].xp, 0);
    const learn = (item, score, passed, xp) =>
      db.query(
        "select * from public.record_academy_progress($1, 'python', $2, $3, $4, $5)",
        [alice, item, score, passed, xp],
      );
    assert.equal((await learn("hello", null, false, 0)).rows[0].attempts, 0);
    assert.equal((await learn("hello", 0, false, 25)).rows[0].xp, 0);
    const completed = (await learn("hello", 100, true, 25)).rows[0];
    assert.equal(completed.xp, 25);
    const retry = (await learn("hello", 100, true, 25)).rows[0];
    assert.equal(retry.xp, 25);
    assert.equal(retry.attempts, 3);
    assert.equal(String(completed.completed_at), String(retry.completed_at));
    assert.equal(
      (await learn("module-1", 75, false, 40)).rows[0].completed_at,
      null,
    );

    await db.exec(
      `reset role; set role authenticated; set "request.jwt.claim.sub" = '${alice}'`,
    );
    await db.query(
      `insert into public.profiles (id, username, experience, preferences, goal)
      values ($1, 'alice', 'Complete beginner', array['Python'], 'Build projects')
      on conflict (id) do update set id = excluded.id, username = excluded.username`,
      [alice],
    );
    await assert.rejects(
      db.query("update public.profiles set id = $1", [bob]),
      /row-level security/i,
    );
    await assert.rejects(record(alice, first), /permission denied/i);
    await assert.rejects(learn("final", 100, true, 60), /permission denied/i);
    await assert.rejects(
      db.exec("update public.academy_progress set xp = 500"),
      /permission denied/i,
    );
    assert.equal(
      (await db.query("select * from public.academy_progress")).rows.length,
      2,
    );
    await assert.rejects(
      db.exec("update public.output_attempts set correct = true"),
      /permission denied/i,
    );
    assert.deepEqual(
      (await db.query("select distinct user_id from public.output_attempts"))
        .rows,
      [{ user_id: alice }],
    );
    const [progress] = (
      await db.query("select * from public.output_progress()")
    ).rows;
    assert.equal(Number(progress.xp), 5);
    assert.equal(Number(progress.attempts), 2);
    assert.equal(Number(progress.correct), 2);
    const summary = (user) =>
      db.query(
        "insert into public.training_summaries (user_id, session_id, language, difficulty, correct, wrong_attempts, skipped, assisted, elapsed_seconds) values ($1, $2, 'Python', 'Beginner', 1, 1, 4, 1, 30)",
        [user, first],
      );
    await summary(alice);
    const {
      rows: [{ dashboard }],
    } = await db.query("select public.learning_dashboard() as dashboard");
    assert.deepEqual(dashboard.totals, {
      attempts: 2,
      correct: 2,
      assisted: 1,
      unclassified: 1,
    });
    assert.equal(dashboard.completion[0].completed, 1);
    assert.equal(dashboard.xp, 5);
    assert.equal(dashboard.seconds, 30);
    assert.equal(dashboard.streak, 1);
    assert.equal(dashboard.best_streak, 1);
    assert.equal(dashboard.week.length, 7);
    assert.equal(dashboard.sessions.length, 1);
    await assert.rejects(summary(alice), /duplicate key/i);
    await assert.rejects(summary(bob), /row-level security/i);
    assert.equal(
      (await db.query("select assisted from public.training_summaries")).rows[0]
        .assisted,
      1,
    );
    await db.exec(`set "request.jwt.claim.sub" = '${bob}'`);
    assert.equal(
      (await db.query("select * from public.academy_progress")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select public.learning_dashboard() as dashboard"))
        .rows[0].dashboard.xp,
      0,
    );
    assert.equal(
      (await db.query("select * from public.training_summaries")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.profiles")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.output_xp")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
