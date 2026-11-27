"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { gradeAcademy, openAcademyItem } from "../app/learn/actions";
import type {
  CourseId,
  Example,
  Exercise,
  Lesson,
  LessonTutor,
  Question,
} from "../lib/academy/types";
import { explainLab } from "../lib/lab/explain";
import { unlockAudio, playSound } from "../lib/sensei/sound";
import { DojoLab } from "./dojo-lab";
import { DojoSensei } from "./dojo-sensei";

type Reading = Omit<Lesson, "slug" | "title" | "minutes" | "question">;
type QuizFeedback = Awaited<ReturnType<typeof gradeAcademy>>;

export function AcademyLesson({
  course,
  language,
  itemId,
  title,
  lesson,
  project,
  questions,
  reviewExample,
  signedIn,
  completed,
  bestScore,
}: {
  course: CourseId;
  language: "Python" | "JavaScript";
  itemId: string;
  title: string;
  lesson?: Reading;
  project?: Exercise;
  questions: Pick<Question, "prompt" | "options">[];
  reviewExample: Example;
  signedIn: boolean;
  completed: boolean;
  bestScore?: number | null;
}) {
  const [result, setResult] = useState<QuizFeedback>();
  const [pending, startTransition] = useTransition();
  const [labNote, setLabNote] = useState<string>();
  const [tutorOpen, setTutorOpen] = useState(0);
  const markedComplete =
    completed || (result && "passed" in result && result.passed);
  useEffect(() => {
    if (signedIn)
      void openAcademyItem({ course, item: itemId }).catch(() => {});
  }, [course, itemId, signedIn]);

  function grade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answers = questions.map((_, position) => {
      const selected = form.get("answer-" + position);
      return selected === null ? -1 : Number(selected);
    });
    unlockAudio();
    startTransition(async () => {
      try {
        const next = await gradeAcademy({ course, item: itemId, answers });
        if ("passed" in next) playSound(next.passed ? "complete" : "incorrect");
        setResult(next);
      } catch {
        setResult({
          error: "The knowledge check couldn’t be graded. Try again.",
        });
      }
    });
  }

  function playground(source: string, expected: string) {
    return (
      <DojoLab
        original={source}
        initialLanguage={language}
        expectedOutput={expected}
        onExplain={({ code, language, result }) => {
          setLabNote(explainLab(language, code, result));
          setTutorOpen((value) => value + 1);
          requestAnimationFrame(() =>
            document
              .getElementById("practice-tutor")
              ?.scrollIntoView({ block: "nearest" }),
          );
        }}
      />
    );
  }

  function exercise(item: Exercise) {
    return (
      <section className="card dojo-panel academy-reading">
        <h2>
          {project ? "Mini project" : "Try it yourself"} · {item.title}
        </h2>
        <p>{item.task}</p>
        <details>
          <summary>Hint</summary>
          <p>{item.hint}</p>
        </details>
        <p>Sample success criterion</p>
        <pre>
          <code>{item.expected}</code>
        </pre>
        {playground(item.starter, item.expected)}
      </section>
    );
  }

  const tutor: LessonTutor = {
    id: course + ":" + itemId,
    topic: language + " · " + title,
    simple: lesson
      ? lesson.definition[0] + " means this. " + lesson.definition[1]
      : "Use the knowledge check to see which topics to revisit. Review the course outline before you try again.",
    steps: lesson
      ? "First read the example’s starting values. " +
        lesson.examples[0].explanation +
        " Then run it to confirm the result."
      : "Work through each question in order. Predict what the code does, then select the statement that matches your trace.",
    hint:
      lesson?.exercise.hint ??
      project?.hint ??
      "Review earlier lessons and explain each option in your own words.",
    example: lesson?.examples[1] ?? reviewExample,
    question: questions[0].prompt,
  };

  return (
    <div className="academy-lesson-layout">
      <article className="academy-lesson-content">
        {lesson && (
          <>
            <section className="card dojo-panel academy-reading">
              <h2>What you’ll learn</h2>
              <ul>
                {lesson.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
              <p>{lesson.introduction}</p>
              <dl>
                <dt>{lesson.definition[0]}</dt>
                <dd>{lesson.definition[1]}</dd>
              </dl>
              <h3>Syntax</h3>
              <p>{lesson.syntax}</p>
              <h3>In practice</h3>
              <p>{lesson.application}</p>
            </section>
            <section className="card dojo-panel academy-reading">
              <h2>Worked examples</h2>
              {lesson.examples.map((example) => (
                <div key={example.title}>
                  <h3>{example.title}</h3>
                  <pre tabIndex={0}>
                    <code>{example.code}</code>
                  </pre>
                  <p>{example.explanation}</p>
                  {playground(example.code, example.output)}
                </div>
              ))}
              <h3>Common mistake</h3>
              <p>{lesson.mistake}</p>
            </section>
            {exercise(lesson.exercise)}
          </>
        )}
        {project && exercise(project)}
        <section className="card dojo-panel academy-reading">
          <h2>{lesson ? "Knowledge check" : "Assessment"}</h2>
          <p>
            {lesson
              ? "Answer correctly to mark this lesson complete."
              : "Score at least 80% to pass. Review the explanations after submitting."}
          </p>
          {bestScore != null && <p>Saved best score {bestScore}%</p>}
          <form onSubmit={grade}>
            {questions.map((question, position) => (
              <fieldset className="academy-question" key={question.prompt}>
                <legend>{question.prompt}</legend>
                {question.options.map((option, value) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={"answer-" + position}
                      value={value}
                      required
                    />{" "}
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <button className="button" disabled={pending}>
              {pending
                ? "Checking…"
                : lesson
                  ? "Mark as Complete"
                  : "Submit assessment"}
            </button>
          </form>
          <div aria-live="polite">
            {result &&
              ("error" in result ? (
                <p>{result.error}</p>
              ) : (
                <>
                  <p
                    className={
                      result.passed ? "dojo-correct" : "dojo-incorrect"
                    }
                  >
                    {result.score}% ·{" "}
                    {result.passed ? "Passed" : "Review and try again"}
                  </p>
                  <ol>
                    {result.review.map((entry, index) => (
                      <li key={index}>
                        {entry.correct ? "Correct. " : "Review. "}
                        {entry.explanation}
                      </li>
                    ))}
                  </ol>
                  {result.saved ? (
                    <p>Progress saved to your account.</p>
                  ) : result.signedIn ? (
                    <p>
                      Progress could not be saved. Check the Academy migration
                      and try again.
                    </p>
                  ) : (
                    <p>
                      <Link href="/login">Sign in</Link> to save progress and
                      earn Academy XP.
                    </p>
                  )}
                </>
              ))}
          </div>
          {markedComplete && <p className="academy-badge">Completed</p>}
        </section>
        {lesson && (
          <section className="card dojo-panel academy-reading">
            <h2>Lesson summary</h2>
            <p>{lesson.summary}</p>
          </section>
        )}
      </article>
      <DojoSensei
        lesson={tutor}
        labNote={labNote}
        openRequest={tutorOpen}
        reaction={
          markedComplete
            ? {
                mood: "happy",
                text: "Lesson goal reached. Try the next item when you’re ready.",
              }
            : {
                mood: "idle",
                text: "Ask for a hint, a worked example, or a short quiz.",
              }
        }
      />
    </div>
  );
}
