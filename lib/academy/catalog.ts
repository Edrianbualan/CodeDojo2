import { python } from "../../content/academy/python.ts";
import { javascript } from "../../content/academy/javascript.ts";
import { assessments } from "../../content/academy/assessments.ts";
import type { Course, Progress } from "./types.ts";

export const courses: Course[] = [python, javascript];
export const upcoming = [
  "C",
  "C++",
  "Java",
  "HTML",
  "CSS",
  "PHP",
  "SQL",
] as const;
export const academyHref = (course: string, item?: string) =>
  "/learn/" + course + (item ? "/" + item : "");

export function findCourse(id: string) {
  return courses.find((course) => course.id === id);
}

export function curriculum(course: Course) {
  const modules = course.modules.map((module, index) => {
    const lessons = module.lessons.map((lesson) => ({
      id: lesson.slug,
      title: lesson.title,
      kind: "lesson" as const,
      questions: [lesson.question],
      xp: 25,
      minutes: lesson.minutes,
      level: module.level,
      lesson,
    }));
    const quiz = {
      id: "module-" + (index + 1),
      title: module.level + " project and quiz",
      kind: "module" as const,
      questions: assessments[course.id].modules[index],
      xp: 40,
      minutes: 20,
      project: module.project,
      level: module.level,
    };
    return { ...module, lessons, quiz };
  });
  const final = {
    id: "final",
    title: "Final course assessment",
    kind: "final" as const,
    questions: assessments[course.id].final,
    xp: 60,
    minutes: 20,
    level: "Course review",
  };
  return {
    modules,
    final,
    items: [
      ...modules.flatMap((module) => [...module.lessons, module.quiz]),
      final,
    ],
  };
}

export function summarize(course: Course, records: Progress[]) {
  const { modules, items, final } = curriculum(course);
  const byId = new Map(
    records
      .filter((row) => row.course_id === course.id)
      .map((row) => [row.item_id, row]),
  );
  const lessons = items.filter((item) => item.kind === "lesson");
  const complete = (id: string) => Boolean(byId.get(id)?.completed_at);
  const completedLessons = lessons.filter((item) => complete(item.id)).length;
  const completedModules = modules.filter(
    (module) =>
      complete(module.quiz.id) &&
      module.lessons.every((lesson) => complete(lesson.id)),
  ).length;
  const xp = items.reduce((sum, item) => sum + (byId.get(item.id)?.xp ?? 0), 0);
  const dates = new Set(
    items
      .map((item) => byId.get(item.id)?.completed_at?.slice(0, 10))
      .filter(Boolean),
  );
  const day = new Date();
  if (!dates.has(day.toISOString().slice(0, 10)))
    day.setUTCDate(day.getUTCDate() - 1);
  let streak = 0;
  while (dates.has(day.toISOString().slice(0, 10))) {
    streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return {
    completedLessons,
    lessonCount: lessons.length,
    completedModules,
    percent: Math.round((100 * completedLessons) / lessons.length),
    xp,
    streak,
    minutes: items.reduce((sum, item) => sum + item.minutes, 0),
    badge: completedModules === modules.length && complete(final.id),
    next: items.find((item) => !complete(item.id)) ?? items[0],
    byId,
  };
}

export function resumeAcademy(records: Progress[]) {
  const newest = records
    .filter((row) => {
      const course = findCourse(row.course_id);
      return (
        course &&
        curriculum(course).items.some((item) => item.id === row.item_id)
      );
    })
    .sort((a, b) => b.last_accessed_at.localeCompare(a.last_accessed_at))[0];
  return newest ? academyHref(newest.course_id, newest.item_id) : "/learn";
}
