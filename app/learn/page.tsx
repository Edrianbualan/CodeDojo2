import Link from "next/link";
import {
  academyHref,
  courses,
  resumeAcademy,
  summarize,
  upcoming,
} from "../../lib/academy/catalog";
import { academyProgress } from "../../lib/academy/progress";

export const metadata = { title: "CodeDojo Academy" };
export const dynamic = "force-dynamic";

export default async function Learn() {
  const { records, signedIn, error } = await academyProgress();
  const resume = resumeAcademy(records);
  return (
    <section className="wrap section academy">
      <h1>CodeDojo Academy</h1>
      <p className="intro">
        Learn by reading, running code, and building small projects.
      </p>
      {resume !== "/learn" && (
        <Link className="button" href={resume}>
          Continue Learning
        </Link>
      )}
      {!signedIn && (
        <p className="muted">
          Try every lesson as a guest. <Link href="/login">Sign in</Link> to
          save Academy progress.
        </p>
      )}
      {error && (
        <p role="status">
          Academy progress is unavailable. Check the Academy migration in your
          development setup.
        </p>
      )}
      <div className="academy-courses">
        {courses.map((course) => {
          const summary = summarize(course, records);
          return (
            <article
              className="card academy-card"
              data-course={course.id}
              key={course.id}
            >
              <h2>{course.language}</h2>
              <p>{course.description}</p>
              <p>
                {summary.lessonCount} lessons · 3 module quizzes · 1 final
                assessment
              </p>
              {signedIn && !error && (
                <label className="dojo-progress">
                  {summary.completedLessons} of {summary.lessonCount} lessons
                  complete
                  <progress
                    value={summary.completedLessons}
                    max={summary.lessonCount}
                  />
                </label>
              )}
              <Link className="button" href={academyHref(course.id)}>
                View {course.language} course
              </Link>
            </article>
          );
        })}
      </div>
      <section className="card dojo-panel">
        <h2>Languages without an Academy course yet</h2>
        <p>{upcoming.join(" · ")}</p>
      </section>
    </section>
  );
}
