import Link from "next/link";
import { notFound } from "next/navigation";
import {
  academyHref,
  curriculum,
  findCourse,
  summarize,
} from "../../../lib/academy/catalog";
import { academyProgress } from "../../../lib/academy/progress";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const course = findCourse((await params).course);
  if (!course) notFound();
  const { records, signedIn, error } = await academyProgress();
  const summary = summarize(course, records);
  const { modules, final } = curriculum(course);
  return (
    <section className="wrap section academy">
      <Link href="/learn">All courses</Link>
      <h1>Learn {course.language}</h1>
      <p className="intro">{course.description}</p>
      <div className="card dojo-panel">
        <p>Estimated course time {summary.minutes} minutes</p>
        {signedIn && !error && (
          <>
            <label className="dojo-progress">
              {summary.percent}% of lessons complete
              <progress
                value={summary.completedLessons}
                max={summary.lessonCount}
              />
            </label>
            <p>
              {summary.completedModules} of {modules.length} modules complete ·{" "}
              {summary.xp} Academy XP · {summary.streak}-day learning streak
            </p>
            {summary.badge && (
              <p className="dojo-correct">Course completion badge earned</p>
            )}
          </>
        )}
        {error && (
          <p role="status">
            Academy progress could not load. Check the Academy migration.
          </p>
        )}
        <Link className="button" href={academyHref(course.id, summary.next.id)}>
          {summary.completedLessons ? "Continue course" : "Start course"}
        </Link>
      </div>
      <div className="academy-path">
        {modules.map((module) => (
          <section key={module.level} className="card dojo-panel">
            <h2>{module.level}</h2>
            <ol>
              {[...module.lessons, module.quiz].map((item) => {
                const record = summary.byId.get(item.id);
                return (
                  <li key={item.id}>
                    <Link href={academyHref(course.id, item.id)}>
                      {item.title}
                    </Link>
                    <span>
                      {record?.completed_at
                        ? "Completed"
                        : item.minutes + " min"}
                      {record?.best_score != null &&
                        " · Best " + record.best_score + "%"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        <section className="card dojo-panel">
          <h2>Course assessment</h2>
          <Link href={academyHref(course.id, final.id)}>{final.title}</Link>
          {summary.byId.get(final.id)?.best_score != null && (
            <p>Best score {summary.byId.get(final.id)?.best_score}%</p>
          )}
        </section>
      </div>
    </section>
  );
}
