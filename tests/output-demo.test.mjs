import assert from "node:assert/strict";
import { test } from "node:test";
import { examples } from "../content/output-demo.ts";

test("each public example has a unique language and a valid answer choice", () => {
  assert.equal(
    new Set(examples.map(({ language }) => language)).size,
    examples.length,
  );
  for (const exercise of examples) {
    assert.ok(exercise.lines.length > 0);
    assert.ok(exercise.explanation.length > 0);
    assert.equal(new Set(exercise.options).size, exercise.options.length);
    assert.ok(exercise.options.includes(exercise.correct));
  }
});
