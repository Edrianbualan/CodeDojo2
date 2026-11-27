import Link from "next/link";
import { notFound } from "next/navigation";
import {
  academyHref,
  curriculum,
  findCourse,
} from "../../../../lib/academy/catalog";
import { academyProgress } from "../../../../lib/academy/progress";
import { AcademyLesson } from "../../../../components/academy-lesson";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ course: string; item: string }>;
}) {
  const route = await params;
  const course = findCourse(route.course);
  if (!course) notFound();
  const { items } = curriculum(course);
  const index = items.findIndex((item) => item.id === route.item);
  if (index < 0) notFound();
  const item = items[index];
  const academic = await academyProgress();
  const progress = academic.records.find(
    (row) => row.course_id === course.id && row.item_id === item.id,
  );
  const lesson = item.kind === "lesson" ? item.lesson : undefined;
  const previous = items[index - 1];
  const next = items[index + 1];
  return (
    <section className="wrap section academy">
      <Link href={academyHref(course.id)}>
        Back to {course.language} course
      </Link>
      <h1>{item.title}</h1>
      <p className="muted">
        {course.language} · {item.level} · {item.minutes} min
      </p>
      <details className="card academy-outline">
        <summary>Course outline</summary>
        <nav aria-label={course.language + " lessons"}>
          <ol>
            {items.map((entry) => (
              <li key={entry.id}>
                <Link
                  aria-current={entry.id === item.id ? "page" : undefined}
                  href={academyHref(course.id, entry.id)}
                >
                  {entry.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </details>
      <AcademyLesson
        key={course.id + ":" + item.id}
        course={course.id}
        language={course.language}
        itemId={item.id}
        title={item.title}
        lesson={
          lesson && {
            objectives: lesson.objectives,
            introduction: lesson.introduction,
            definition: lesson.definition,
            syntax: lesson.syntax,
            application: lesson.application,
            examples: lesson.examples,
            mistake: lesson.mistake,
            exercise: lesson.exercise,
            summary: lesson.summary,
          }
        }
        project={item.kind === "module" ? item.project : undefined}
        questions={item.questions.map((question) => ({
          prompt: question.prompt,
          options: question.options,
        }))}
        reviewExample={course.modules[0].lessons[0].examples[1]}
        signedIn={academic.signedIn}
        completed={Boolean(progress?.completed_at)}
        bestScore={progress?.best_score}
      />
      <div className="actions academy-navigation">
        {previous && (
          <Link
            className="button outline"
            href={academyHref(course.id, previous.id)}
          >
            Previous Lesson
          </Link>
        )}
        {next ? (
          <Link className="button" href={academyHref(course.id, next.id)}>
            Next Lesson
          </Link>
        ) : (
          <Link className="button" href={academyHref(course.id)}>
            Review course progress
          </Link>
        )}
      </div>
    </section>
  );
}
