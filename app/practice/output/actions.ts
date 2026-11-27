"use server";

import { z } from "zod";
import { account, serviceClient } from "../../../lib/supabase/server";
import { authConfig } from "../../../lib/supabase/config";
import { accountHelp, accountIssue } from "../../../lib/supabase/diagnostics";
import { makeTutorReply } from "../../../lib/sensei/reply";
import { askOllama } from "../../../lib/sensei/ollama";
import {
  tutorActions,
  type TutorAction,
  type TutorReply,
} from "../../../lib/sensei/types";
import {
  findQuestion,
  selectQuestions,
  xpValues,
} from "../../../lib/output/bank";
import {
  difficulties,
  languages,
  type Feedback,
  type Prompt,
} from "../../../lib/output/types";

const questionId = z
  .string()
  .regex(/^(python|javascript)-[0-3]-[0-4]-(?:[0-9]|1[0-3])$/);
const setup = z.object({
  language: z.enum(languages),
  difficulty: z.enum(difficulties),
  length: z.number().int().min(1).max(70),
  random: z.boolean().default(true),
  recent: z.array(questionId).max(560),
});

const help = z.object({
  id: questionId,
  action: z.enum(Object.keys(tutorActions) as TutorAction[]),
});

const chat = z.object({
  id: questionId,
  message: z.string().trim().min(1).max(600),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1600),
      }),
    )
    .max(8),
});

export async function chatWithSensei(input: unknown): Promise<string | null> {
  const request = chat.safeParse(input);
  if (!request.success || (authConfig() && !(await account()))) return null;
  const question = findQuestion(request.data.id);
  if (!question) return null;
  const hint = makeTutorReply(question.id, "hint")?.text ?? "";
  return askOllama(
    [
      question.language,
      question.difficulty,
      question.topic,
      question.code,
      hint,
    ].join("\n"),
    request.data.message,
    request.data.history,
  );
}

export async function getOutputHelp(
  input: unknown,
): Promise<{ reply: TutorReply } | { error: string }> {
  const request = help.safeParse(input);
  if (!request.success)
    return { error: "Choose a tutor action for this question." };
  if (authConfig() && !(await account()))
    return { error: "Sign in to continue using the tutor." };
  const reply = makeTutorReply(request.data.id, request.data.action);
  return reply ? { reply } : { error: "This question is unavailable." };
}

export async function startOutput(
  input: unknown,
): Promise<{ prompts: Prompt[] } | { error: string }> {
  const settings = setup.safeParse(input);
  if (!settings.success)
    return { error: "Choose a valid language, difficulty and session length." };
  if (authConfig() && !(await account()))
    return { error: "Sign in to start practice." };
  const { language, difficulty, length, recent, random } = settings.data;
  return {
    prompts: selectQuestions(language, difficulty, length, recent, random),
  };
}

const submission = z.object({
  id: questionId,
  attempt: z.uuid(),
  answer: z
    .string()
    .trim()
    .regex(/^-?[0-9]{1,10}$/),
  mode: z.enum(["choice", "written"]),
  assisted: z.boolean().default(false),
});

export async function saveTrainingSummary(input: unknown) {
  const count = z.number().int().min(0).max(2147483647);
  const values = z
    .object({
      session_id: z.uuid(),
      language: z.enum(languages),
      difficulty: z.enum(difficulties),
      correct: count,
      wrong_attempts: count,
      skipped: count,
      assisted: count,
      elapsed_seconds: count,
    })
    .safeParse(input);
  if (!values.success) return false;
  const session = await account();
  if (!session) return false;
  // Personal session notes are kept apart from the verified XP ledger.
  const { error } = await session.client
    .from("training_summaries")
    .insert({ ...values.data, user_id: session.user.id });
  return !error || error.code === "23505";
}

export async function gradeOutput(
  input: unknown,
): Promise<{ feedback: Feedback } | { error: string }> {
  const result = submission.safeParse(input);
  if (!result.success) return { error: "That answer could not be checked." };
  const { id, attempt, answer, mode, assisted } = result.data;
  const question = findQuestion(id);
  if (!question || (mode === "choice" && !question.options.includes(answer)))
    return { error: "Choose one of the listed answers." };

  const session = authConfig() ? await account() : null;
  if (authConfig() && !session)
    return { error: "Your session expired. Sign in to continue." };
  const correct =
    mode === "written"
      ? Number(answer) === Number(question.answer)
      : answer === question.answer;
  let xp = correct ? xpValues[question.difficulty] : 0;
  if (session) {
    const writer = serviceClient();
    if (!writer)
      return {
        error: "Saving practice requires the server’s Supabase secret key.",
      };
    const saved = await writer.rpc("record_output_answer_with_assistance", {
      p_user: session.user.id,
      p_attempt: attempt,
      p_question: id,
      p_choice: answer,
      p_language: question.language,
      p_difficulty: question.difficulty,
      p_correct: correct,
      p_assisted: assisted,
    });
    if (saved.error)
      return {
        error:
          "Progress couldn’t be saved. " +
          accountHelp[accountIssue(saved.error)],
      };
    if (typeof saved.data !== "number")
      return { error: "Progress couldn’t be saved. Try again." };
    xp = saved.data;
  }
  return {
    feedback: {
      correct,
      xp,
      answer: correct ? question.answer : "",
      explanation: correct
        ? question.explanation
        : (makeTutorReply(id, "hint")?.text ?? ""),
    },
  };
}
