import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  courses,
  curriculum,
  resumeAcademy,
  summarize,
} from "../lib/academy/catalog.ts";
import { gradeQuestions } from "../lib/academy/grade.ts";

test("course items, projects and assessment questions are unique and valid", () => {
  assert.equal(courses.length, 2);
  for (const course of courses) {
    const { modules, final, items } = curriculum(course);
    assert.equal(modules.length, 3);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    assert.equal(final.questions.length, 6);
    const questions = items.flatMap((item) => item.questions);
    assert.equal(
      new Set(questions.map((question) => question.prompt)).size,
      questions.length,
    );
    for (const question of questions)
      assert.ok(question.options[question.answer] && question.explanation);
    for (const chapter of modules) {
      assert.equal(chapter.quiz.questions.length, 4);
      assert.ok(
        chapter.project.starter &&
          chapter.project.expected &&
          chapter.project.hint,
      );
      for (const item of chapter.lessons)
        assert.equal(item.lesson.examples.length, 2);
    }
  }
});

test("the grader validates options and applies the exact pass threshold", () => {
  const questions = curriculum(courses[0]).final.questions;
  const correct = questions.map((question) => question.answer);
  const wrong = correct.map((value) => (value + 1) % 3);
  assert.equal(gradeQuestions(questions, correct).score, 100);
  assert.equal(
    gradeQuestions(questions, [wrong[0], ...correct.slice(1)]).passed,
    true,
  );
  assert.equal(
    gradeQuestions(questions, [wrong[0], wrong[1], ...correct.slice(2)]).passed,
    false,
  );
  assert.equal(gradeQuestions(questions, [0]), null);
  assert.equal(gradeQuestions(questions, [3, ...correct.slice(1)]), null);
});

test("Academy completion and resume use real saved items", () => {
  const course = courses[0];
  const { items, modules } = curriculum(course);
  const day = new Date().toISOString();
  const records = items.map((item) => ({
    course_id: course.id,
    item_id: item.id,
    xp: item.xp,
    last_accessed_at: day,
    completed_at: day,
    best_score: 100,
    attempts: 2,
  }));
  const one = summarize(course, records.slice(0, 1));
  assert.equal(one.percent, Math.round(100 / one.lessonCount));
  assert.equal(one.completedModules, 0);
  assert.equal(one.badge, false);
  assert.equal(one.streak, 1);
  const full = summarize(course, records);
  assert.equal(full.percent, 100);
  assert.equal(full.completedModules, modules.length);
  assert.equal(full.badge, true);
  assert.equal(resumeAcademy(records.slice(-1)), "/learn/python/final");
  assert.equal(resumeAcademy([]), "/learn");
});

function examples(language) {
  return courses
    .find((course) => course.language === language)
    .modules.flatMap((module) =>
      module.lessons.flatMap((lesson) => lesson.examples),
    );
}

test("all authored JavaScript Academy examples produce their documented output", async () => {
  for (const example of examples("JavaScript")) {
    const lines = [];
    await runInNewContext(
      "(async () => {\n" + example.code + "\n})()",
      {
        console: { log: (...values) => lines.push(values.join(" ")) },
      },
      { timeout: 1000 },
    );
    assert.equal(lines.join("\n"), example.output, example.title);
  }
});

test("all authored Python Academy examples produce their documented output", (t) => {
  const python = process.env.CODEDOJO_PYTHON ?? "python";
  if (spawnSync(python, ["--version"], { timeout: 5000 }).status !== 0) {
    t.skip("Python is unavailable");
    return;
  }
  const runner =
    "import contextlib, io, json, os, sys, tempfile\nresults = []\nwith tempfile.TemporaryDirectory() as sandbox:\n    os.chdir(sandbox)\n    for code in json.load(sys.stdin):\n        stream = io.StringIO()\n        with contextlib.redirect_stdout(stream):\n            exec(code, {})\n        results.append(stream.getvalue().rstrip('\\n'))\n    os.chdir(os.path.dirname(sandbox))\nprint(json.dumps(results))";
  const authored = examples("Python");
  const result = spawnSync(python, ["-I", "-c", runner], {
    input: JSON.stringify(authored.map((example) => example.code)),
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    JSON.parse(result.stdout),
    authored.map((example) => example.output),
  );
});
