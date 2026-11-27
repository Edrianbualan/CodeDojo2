import { test } from "node:test";
import assert from "node:assert/strict";
import { findQuestion } from "../lib/output/bank.ts";
import { makeTutorReply } from "../lib/sensei/reply.ts";
import { practiceLevel } from "../lib/sensei/types.ts";

test("DojoSensei gives a contextual clue and reveals the answer on request", () => {
  const id = "python-0-0-0";
  const question = findQuestion(id);
  assert.equal(
    makeTutorReply(id, "hint").text.includes("multiplication"),
    true,
  );
  assert.doesNotMatch(makeTutorReply(id, "steps").text, /The output is/);
  assert.match(
    makeTutorReply(id, "answer").text,
    new RegExp(`The output is ${question.answer}\\.`),
  );
  assert.match(makeTutorReply(id, "wrong").text, /Check your answer first/);
  assert.equal(makeTutorReply("missing", "hint"), null);
});

test("similar examples preserve the language and topic without repeating the current code", () => {
  const id = "javascript-3-3-13";
  const question = findQuestion(id);
  const similar = makeTutorReply(id, "similar");
  assert.match(similar.text, /promise ordering/i);
  assert.notEqual(similar.code, question.code);
  assert.equal(similar.code, findQuestion("javascript-3-3-0").code);
});

test("practice level increases every 100 earned XP", () => {
  assert.deepEqual([0, 99, 100, 199, 200].map(practiceLevel), [1, 1, 2, 2, 3]);
});
