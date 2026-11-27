"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getOutputHelp,
  gradeOutput,
  saveTrainingSummary,
  startOutput,
} from "../app/practice/output/actions";
import { DojoSensei } from "./dojo-sensei";
import { practiceLevel, type Reaction } from "../lib/sensei/types";
import {
  audioSnapshot,
  playSound,
  unlockAudio,
  updateAudio,
} from "../lib/sensei/sound";
import type { SessionConfig } from "../lib/output/config";
import {
  difficulties,
  languages,
  lengths,
  type Feedback,
  type Language,
  type Prompt,
} from "../lib/output/types";

type Result = {
  feedback?: Feedback;
  wrong: number;
  xp: number;
  skipped?: boolean;
  assisted?: boolean;
  retrying?: boolean;
};
type Round = {
  prompts: Prompt[];
  results: Record<string, Result>;
  started: number;
  ended?: number;
};
const idle: Reaction = { mood: "idle", text: "I can help you trace the code." };
const elapsedLabel = (seconds: number) =>
  Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");

export function OutputSession({
  saved,
  preferredLanguage,
  initialXp,
  config,
  initialPrompts,
  modelEnabled,
}: {
  saved: boolean;
  preferredLanguage: Language;
  initialXp: number | null;
  config?: SessionConfig;
  initialPrompts?: Prompt[];
  modelEnabled: boolean;
}) {
  const [settings, setSettings] = useState<SessionConfig>(
    config ?? {
      language: preferredLanguage,
      difficulty: "Beginner",
      length: 10,
      mode: "choice",
      minutes: 0,
      random: "on",
      sound: "off",
      tutor: "on",
    },
  );
  const [round, setRound] = useState<Round | undefined>(() =>
    initialPrompts
      ? { prompts: initialPrompts, results: {}, started: 0 }
      : undefined,
  );
  const [position, setPosition] = useState(0);
  const [choice, setChoice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [xpTotal, setXpTotal] = useState(initialXp);
  const [reaction, setReaction] = useState<Reaction>(idle);
  const [popup, setPopup] = useState<Feedback>();
  const [solution, setSolution] = useState("");
  const [tutorOpen, setTutorOpen] = useState(0);
  const [clock, setClock] = useState(0);
  const seen = useRef(new Set<string>());
  const rewarded = useRef(new Set<string>());
  const attempt = useRef("");
  const busy = useRef(false);
  const modal = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const sessionId = useRef("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "failed">();
  const [saveRetry, setSaveRetry] = useState(0);

  useEffect(() => {
    if (!config) return;
    updateAudio({ ...audioSnapshot(), enabled: config.sound === "on" });
  }, [config]);

  const started = round?.started;
  const ended = round?.ended;
  useEffect(() => {
    if (started === undefined || ended !== undefined) return;
    if (started === 0) {
      const id = window.setTimeout(
        () =>
          setRound((current) => current && { ...current, started: Date.now() }),
        0,
      );
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      if (
        !busy.current &&
        settings.minutes &&
        now - started >= settings.minutes * 60000
      ) {
        setPopup(undefined);
        setRound((current) => current && { ...current, ended: now });
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [started, ended, settings.minutes]);

  useEffect(() => {
    const dialog = modal.current;
    if (popup && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [popup]);

  async function run(operation: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await operation();
    } catch {
      setError("The request didn’t finish. Try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function move(index: number) {
    setPosition(index);
    setPopup(undefined);
    setSolution("");
    setChoice("");
    setError("");
    attempt.current = "";
    setReaction(idle);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function begin(prompts: Prompt[]) {
    sessionId.current = "";
    setSaveStatus(undefined);
    setRound({ prompts, results: {}, started: Date.now() });
    move(0);
  }

  function start(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    unlockAudio("select");
    const form = event ? new FormData(event.currentTarget) : null;
    const next = form
      ? {
          ...settings,
          language: form.get("language") as SessionConfig["language"],
          difficulty: form.get("difficulty") as SessionConfig["difficulty"],
          length: Number(form.get("length")),
          mode: form.get("mode") as SessionConfig["mode"],
        }
      : settings;
    void run(async () => {
      const result = await startOutput({
        ...next,
        length: next.length === "unlimited" ? 70 : next.length,
        random: next.random === "on",
        recent: [...seen.current],
      });
      if ("error" in result) setError(result.error);
      else {
        setSettings(next);
        begin(result.prompts);
      }
    });
  }

  const question = round?.prompts[position];
  const current = question && round?.results[position];
  const counts = Object.values(round?.results ?? {});
  const correct = counts.filter((item) => item.feedback?.correct).length;
  const wrong = counts.filter(
    (item) => item.wrong > 0 && !item.feedback?.correct && !item.skipped,
  ).length;
  const skipped = counts.filter((item) => item.skipped).length;
  const done = correct + wrong + skipped;
  const wrongAttempts = counts.reduce((sum, item) => sum + item.wrong, 0);
  const accuracy =
    correct + wrongAttempts
      ? Math.round((100 * correct) / (correct + wrongAttempts))
      : 0;
  const xp = counts.reduce((sum, item) => sum + item.xp, 0);
  const assisted = counts.filter(
    (item) => item.assisted && (item.feedback || item.wrong > 0),
  ).length;
  const elapsed = round?.started
    ? Math.max(0, Math.floor(((round.ended ?? clock) - round.started) / 1000))
    : 0;
  const timedOut = settings.minutes > 0 && elapsed >= settings.minutes * 60;
  useEffect(() => {
    if (!saved || ended === undefined) return;
    let active = true;
    sessionId.current ||= crypto.randomUUID();
    void saveTrainingSummary({
      session_id: sessionId.current,
      language: settings.language,
      difficulty: settings.difficulty,
      correct,
      wrong_attempts: wrongAttempts,
      skipped,
      assisted,
      elapsed_seconds: elapsed,
    })
      .then((ok) => {
        if (active) setSaveStatus(ok ? "saved" : "failed");
      })
      .catch(() => {
        if (active) setSaveStatus("failed");
      });
    return () => {
      active = false;
    };
  }, [
    saved,
    ended,
    settings.language,
    settings.difficulty,
    correct,
    wrongAttempts,
    skipped,
    assisted,
    elapsed,
    saveRetry,
  ]);
  const written =
    settings.mode === "written" ||
    (settings.mode === "mixed" && position % 2 === 1);

  function record(update: (result: Result) => Result) {
    if (!question) return;
    setRound(
      (value) =>
        value && {
          ...value,
          results: {
            ...value.results,
            [position]: update(value.results[position] ?? { wrong: 0, xp: 0 }),
          },
        },
    );
  }

  function finish() {
    unlockAudio("complete");
    setPopup(undefined);
    setReaction({
      mood: "happy",
      text: "Session complete. Take a look at your progress!",
    });
    setRound((value) => value && { ...value, ended: Date.now() });
    requestAnimationFrame(() => heading.current?.focus());
  }

  function next() {
    if (!round || !question) return;
    seen.current.add(question.id);
    if (position + 1 < round.prompts.length) {
      unlockAudio("next");
      move(position + 1);
    } else if (settings.length === "unlimited") {
      // A new pass can reuse the bank once every question has been offered.
      setPopup(undefined);
      void run(async () => {
        const result = await startOutput({
          ...settings,
          length: 70,
          random: settings.random === "on",
          recent: [question.id],
        });
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setRound(
          (value) =>
            value && {
              ...value,
              prompts: [...value.prompts, ...result.prompts],
            },
        );
        move(position + 1);
      });
    } else finish();
  }

  function skip() {
    if (current?.feedback?.correct) return;
    record((result) => ({ ...result, skipped: true, retrying: false }));
    next();
  }

  function retry() {
    unlockAudio("click");
    record((result) => ({ ...result, skipped: false, retrying: true }));
    setPopup(undefined);
    setSolution("");
    setChoice("");
    attempt.current = "";
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!question || !choice.trim() || current?.feedback?.correct) return;
    unlockAudio();
    void run(async () => {
      attempt.current ||= crypto.randomUUID();
      const result = await gradeOutput({
        id: question.id,
        answer: choice,
        mode: written ? "written" : "choice",
        attempt: attempt.current,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const feedback = result.feedback;
      if (!saved && rewarded.current.has(question.id)) feedback.xp = 0;
      if (feedback.correct) rewarded.current.add(question.id);
      seen.current.add(question.id);
      const updatedXp = xpTotal === null ? null : xpTotal + feedback.xp;
      setXpTotal(updatedXp);
      const leveled =
        updatedXp !== null &&
        xpTotal !== null &&
        practiceLevel(updatedXp) > practiceLevel(xpTotal);
      setReaction(
        feedback.correct
          ? {
              mood: "happy",
              text: leveled
                ? "You reached practice level " + practiceLevel(updatedXp) + "!"
                : "Correct! Nice work tracing the output.",
            }
          : {
              mood: "encouraging",
              text: "Try tracing the values one step at a time.",
            },
      );
      playSound(leveled ? "level" : feedback.correct ? "correct" : "incorrect");
      record((previous) => ({
        ...previous,
        feedback,
        skipped: false,
        retrying: false,
        wrong: previous.wrong + Number(!feedback.correct),
        xp: previous.xp + feedback.xp,
      }));
      setSolution("");
      setPopup(feedback);
      attempt.current = "";
    });
  }

  const unlimited = settings.length === "unlimited";
  const active = round && question && !round.ended;
  const missed =
    round?.prompts.filter(
      (_, index) => (round.results[index]?.wrong ?? 0) > 0,
    ) ?? [];
  const masteredTopics = [
    ...new Set(
      round?.prompts
        .filter(
          (_, index) =>
            round.results[index]?.feedback?.correct &&
            !round.results[index]?.wrong &&
            !round.results[index]?.assisted,
        )
        .map((prompt) => prompt.topic),
    ),
  ];
  const missedTopics = [...new Set(missed.map((prompt) => prompt.topic))];
  const locked =
    current?.feedback?.correct ||
    (!current?.retrying && (current?.feedback || current?.skipped));

  return (
    <div
      className={settings.tutor === "on" ? "dojo-practice-layout" : undefined}
    >
      <div className="dojo-practice-content">
        {!round || !question ? (
          <div className="card dojo-panel">
            <h2 className="dojo-heading">Set up a session</h2>
            <form className="dojo-form" onSubmit={start}>
              <fieldset className="dojo-settings" disabled={pending}>
                <label>
                  Language
                  <select name="language" defaultValue={settings.language}>
                    {languages.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select name="difficulty" defaultValue={settings.difficulty}>
                    {difficulties.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Questions
                  <select name="length" defaultValue={10}>
                    {lengths.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Answer format
                  <select name="mode" defaultValue={settings.mode}>
                    <option value="choice">Multiple choice</option>
                    <option value="written">Written answer</option>
                    <option value="mixed">Mixed mode</option>
                  </select>
                </label>
              </fieldset>
              <div className="actions">
                <button className="button" disabled={pending}>
                  Start session
                </button>
                <Link className="button outline" href="/practice/setup">
                  Customize training
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="card dojo-panel training-session">
            <div className="dojo-score">
              <p>
                <strong>{correct}</strong> correct
              </p>
              <p>
                <strong>{wrongAttempts}</strong> incorrect attempts
              </p>
              <p>
                <strong>{accuracy}%</strong> accuracy
              </p>
              <p>
                <strong>{xp}</strong> XP
              </p>
              {settings.minutes > 0 && (
                <p>
                  <strong>
                    {elapsedLabel(Math.max(0, settings.minutes * 60 - elapsed))}
                  </strong>{" "}
                  remaining
                </p>
              )}
            </div>
            <label className="dojo-progress">
              {done} of {round.prompts.length} reviewed
              {unlimited ? " in this batch" : ""}
              <progress value={done} max={round.prompts.length} />
            </label>
            {round.ended ? (
              <>
                <h2 className="dojo-heading" ref={heading} tabIndex={-1}>
                  {timedOut ? "Time’s up" : "Session complete"}
                </h2>
                {saved && (
                  <p role="status">
                    {saveStatus === "saved"
                      ? "Session summary saved."
                      : saveStatus === "failed"
                        ? "Session summary could not be saved."
                        : "Saving session summary…"}
                  </p>
                )}
                {saveStatus === "failed" && (
                  <button
                    className="button outline"
                    onClick={() => {
                      setSaveStatus(undefined);
                      setSaveRetry((value) => value + 1);
                    }}
                  >
                    Retry saving summary
                  </button>
                )}
                <p>
                  {correct} correct · {wrong} unresolved · {skipped} skipped ·{" "}
                  {assisted} assisted · {elapsedLabel(elapsed)} elapsed
                </p>
                {masteredTopics.length > 0 && (
                  <p>
                    <strong>Strongest topics</strong>{" "}
                    {masteredTopics.join(", ")}
                  </p>
                )}
                {missedTopics.length > 0 && (
                  <p>
                    <strong>Topics to revisit</strong> {missedTopics.join(", ")}
                  </p>
                )}
                <div className="actions">
                  <button
                    className="button"
                    disabled={pending}
                    onClick={() => start()}
                  >
                    {unlimited ? "Continue practice" : "Practice again"}
                  </button>
                  {missed.length > 0 && (
                    <button
                      className="button outline"
                      onClick={() => begin(missed)}
                    >
                      Retry incorrect questions
                    </button>
                  )}
                  <Link className="button outline" href="/practice/setup">
                    Change settings
                  </Link>
                  {saved && (
                    <Link className="button outline" href="/dashboard">
                      Return to dashboard
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="dojo-heading" ref={heading} tabIndex={-1}>
                  Question {position + 1} of {round.prompts.length}
                </h2>
                <p className="muted">
                  {settings.language} · {settings.difficulty} · {question.topic}
                </p>
                {settings.tutor === "on" && (
                  <a href="#practice-tutor" className="dojo-tutor-shortcut">
                    Jump to DojoSensei
                  </a>
                )}
                <pre tabIndex={0} aria-label={settings.language + " snippet"}>
                  <code>{question.code}</code>
                </pre>
                <form onSubmit={submit}>
                  <fieldset disabled={pending || Boolean(locked)}>
                    <legend>What does this code print?</legend>
                    {written ? (
                      <label className="dojo-written">
                        Printed number
                        <input
                          value={choice}
                          onChange={(event) => {
                            setChoice(event.target.value);
                            attempt.current = "";
                          }}
                          maxLength={16}
                          required
                        />
                      </label>
                    ) : (
                      <div className="options">
                        {question.options.map((option) => (
                          <label key={option}>
                            <input
                              type="radio"
                              name="output"
                              checked={choice === option}
                              onChange={() => {
                                setChoice(option);
                                attempt.current = "";
                              }}
                              required
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                  {!locked && (
                    <button
                      className="button compact"
                      disabled={!choice.trim() || pending}
                    >
                      {pending ? "Checking…" : "Check answer"}
                    </button>
                  )}
                </form>
                {locked && (
                  <p role="status">
                    {current?.skipped
                      ? "Skipped"
                      : current?.feedback?.correct
                        ? "Correct"
                        : "Try again or review the hint."}
                  </p>
                )}
                <div className="actions">
                  <button
                    className="button outline"
                    disabled={!position || pending}
                    onClick={() => move(position - 1)}
                  >
                    Previous Question
                  </button>
                  <button
                    className="button outline"
                    disabled={pending || !locked}
                    onClick={next}
                  >
                    {!unlimited && position + 1 === round.prompts.length
                      ? "View summary"
                      : "Next Question"}
                  </button>
                  {!current?.feedback?.correct && (
                    <button
                      className="button outline"
                      disabled={pending}
                      onClick={skip}
                    >
                      Skip Question
                    </button>
                  )}
                  {locked && !current?.feedback?.correct && (
                    <button className="button outline" onClick={retry}>
                      Retry Question
                    </button>
                  )}
                </div>
                <div className="actions dojo-session-controls">
                  <button
                    className="button outline"
                    disabled={pending}
                    onClick={() => start()}
                  >
                    Restart Session
                  </button>
                  {unlimited && (
                    <button
                      className="button outline"
                      disabled={pending}
                      onClick={finish}
                    >
                      Finish and view results
                    </button>
                  )}
                  <Link className="button outline" href="/practice/setup">
                    Exit Session
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
      {settings.tutor === "on" && (
        <DojoSensei
          modelEnabled={modelEnabled}
          prompt={active ? question : undefined}
          feedback={current?.feedback}
          reaction={reaction}
          openRequest={tutorOpen}
          onAssist={() => record((result) => ({ ...result, assisted: true }))}
        />
      )}
      {popup && (
        <dialog
          ref={modal}
          className={
            popup.correct
              ? "answer-popup correct-popup"
              : "answer-popup wrong-popup"
          }
          aria-labelledby="answer-title"
          onCancel={() => setPopup(undefined)}
        >
          <div className="popup-icon" aria-hidden="true">
            {popup.correct ? "✓" : "!"}
          </div>
          <h2 id="answer-title">
            {popup.correct ? "Correct!" : "Not quite right!"}
          </h2>
          <p>
            {popup.correct
              ? popup.explanation
              : "You can try again. Here’s a hint to help you trace it."}
          </p>
          {!popup.correct && <p>{popup.explanation}</p>}
          {popup.correct && (
            <p>
              +{popup.xp} XP · {correct} correct · {done} of{" "}
              {round?.prompts.length} reviewed
            </p>
          )}
          {solution && <p role="status">{solution}</p>}
          <div className="actions">
            {popup.correct ? (
              <button className="button" onClick={next}>
                {!unlimited && position + 1 === round?.prompts.length
                  ? "View summary"
                  : "Next Question"}
              </button>
            ) : (
              <>
                <button className="button" onClick={retry}>
                  Try Again
                </button>
                {settings.tutor === "on" && (
                  <button
                    className="button outline"
                    onClick={() => {
                      setPopup(undefined);
                      setTutorOpen((value) => value + 1);
                      requestAnimationFrame(() =>
                        document
                          .getElementById("practice-tutor")
                          ?.scrollIntoView({ block: "nearest" }),
                      );
                    }}
                  >
                    Ask DojoSensei
                  </button>
                )}
                <button
                  className="button outline"
                  disabled={pending || Boolean(solution)}
                  onClick={() =>
                    void run(async () => {
                      if (!question) return;
                      const result = await getOutputHelp({
                        id: question.id,
                        action: "answer",
                      });
                      if ("reply" in result) {
                        setSolution(result.reply.text);
                        record((previous) => ({ ...previous, assisted: true }));
                      } else setSolution(result.error);
                    })
                  }
                >
                  Show Solution
                </button>
                <button
                  className="button outline"
                  disabled={pending}
                  onClick={skip}
                >
                  Skip Question
                </button>
              </>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
