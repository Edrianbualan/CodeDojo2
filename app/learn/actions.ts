"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { curriculum, findCourse } from "../../lib/academy/catalog";
import { gradeQuestions } from "../../lib/academy/grade";
import { account, serviceClient } from "../../lib/supabase/server";

const itemKey = z.object({
  course: z.string().max(40),
  item: z.string().max(80),
});

function lookup(input: z.infer<typeof itemKey>) {
  const course = findCourse(input.course);
  return course
    ? curriculum(course).items.find((item) => item.id === input.item)
    : undefined;
}

export async function openAcademyItem(input: unknown) {
  const key = itemKey.safeParse(input);
  if (!key.success || !lookup(key.data)) return false;
  const session = await account();
  const writer = serviceClient();
  if (!session || !writer) return false;
  const { error } = await writer.rpc("record_academy_progress", {
    p_user: session.user.id,
    p_course: key.data.course,
    p_item: key.data.item,
    p_score: null,
    p_passed: false,
    p_xp: 0,
  });
  return !error;
}

const submission = itemKey.extend({
  answers: z.array(z.number().int().min(0).max(8)).max(60),
});

export async function gradeAcademy(input: unknown): Promise<
  | { error: string }
  | {
      score: number;
      passed: boolean;
      review: { correct: boolean; explanation: string }[];
      saved: boolean;
      signedIn: boolean;
    }
> {
  const result = submission.safeParse(input);
  if (!result.success)
    return { error: "Choose an answer for every question." } as const;
  const { course, item: id, answers } = result.data;
  const item = lookup(result.data);
  const grade = item && gradeQuestions(item.questions, answers);
  if (!item || !grade) {
    return { error: "Choose a listed answer for every question." } as const;
  }
  const { score, passed, review } = grade;
  const session = await account();
  let saved = false;
  if (session) {
    const writer = serviceClient();
    if (writer) {
      const result = await writer.rpc("record_academy_progress", {
        p_user: session.user.id,
        p_course: course,
        p_item: id,
        p_score: score,
        p_passed: passed,
        p_xp: item.xp,
      });
      saved = !result.error;
      if (saved) {
        revalidatePath("/learn");
        revalidatePath("/learn/" + course);
        revalidatePath("/learn/" + course + "/" + id);
      }
    }
  }
  return { score, passed, review, saved, signedIn: Boolean(session) } as const;
}
