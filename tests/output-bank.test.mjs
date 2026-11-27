import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { runInNewContext } from "node:vm";
import { findQuestion, selectQuestions } from "../lib/output/bank.ts";
import { difficulties, languages, lengths } from "../lib/output/types.ts";

for (const language of languages) {
  for (const difficulty of difficulties) {
    test(`${language} ${difficulty} supports all lengths without repeats or answer leakage`, () => {
      for (const length of lengths) {
        const prompts = selectQuestions(language, difficulty, length);
        assert.equal(prompts.length, length);
        assert.equal(new Set(prompts.map(({ id }) => id)).size, length);
        assert.equal(new Set(prompts.map(({ code }) => code)).size, length);
        for (const prompt of prompts) {
          const question = findQuestion(prompt.id);
          assert.deepEqual(Object.keys(prompt).sort(), [
            "code",
            "id",
            "options",
            "topic",
          ]);
          assert.equal(question.language, language);
          assert.equal(question.difficulty, difficulty);
          assert.equal(new Set(prompt.options).size, 4);
          assert.ok(prompt.options.includes(question.answer));
        }
      }
      const previous = selectQuestions(language, difficulty, 20).map(
        ({ id }) => id,
      );
      const next = selectQuestions(language, difficulty, 50, previous);
      assert.ok(next.every(({ id }) => !previous.includes(id)));
    });
  }
}

test("all original JavaScript snippets print their expected results", async () => {
  const pending = [];
  for (const difficulty of difficulties) {
    const prompts = selectQuestions("JavaScript", difficulty, 70);
    assert.equal(prompts.length, 70);
    for (const prompt of prompts) {
      const output = [];
      runInNewContext(
        prompt.code,
        {
          console: { log: (value) => output.push(String(value)) },
          queueMicrotask,
        },
        { timeout: 500 },
      );
      pending.push({ prompt, output });
    }
  }
  await new Promise(setImmediate);
  for (const { prompt, output } of pending) {
    assert.deepEqual(output, [findQuestion(prompt.id).answer], prompt.id);
  }
});

test("all original Python snippets print their expected results", (t) => {
  const python = process.env.CODEDOJO_PYTHON ?? "python";
  if (spawnSync(python, ["--version"], { timeout: 5000 }).status !== 0) {
    t.skip("Python is unavailable");
    return;
  }
  const prompts = difficulties.flatMap((difficulty) =>
    selectQuestions("Python", difficulty, 70),
  );
  const runner =
    "import contextlib, io, json, sys\nresults = []\nfor code in json.load(sys.stdin):\n    stream = io.StringIO()\n    with contextlib.redirect_stdout(stream):\n        exec(code, {})\n    results.append(stream.getvalue().splitlines())\nprint(json.dumps(results))";
  const result = spawnSync(python, ["-I", "-c", runner], {
    input: JSON.stringify(prompts.map(({ code }) => code)),
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  const outputs = JSON.parse(result.stdout);
  assert.equal(outputs.length, 280);
  outputs.forEach((output, index) => {
    assert.deepEqual(
      output,
      [findQuestion(prompts[index].id).answer],
      prompts[index].id,
    );
  });
});
