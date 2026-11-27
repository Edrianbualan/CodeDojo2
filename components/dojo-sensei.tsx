"use client";

import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { chatWithSensei, getOutputHelp } from "../app/practice/output/actions";
import type { Feedback, Prompt } from "../lib/output/types";
import type { LessonTutor } from "../lib/academy/types";
import {
  tutorActions,
  type Mood,
  type Reaction,
  type TutorAction,
  type TutorReply,
} from "../lib/sensei/types";
import {
  audioDefaults,
  audioSnapshot,
  playSound,
  subscribeAudio,
  unlockAudio,
  updateAudio,
} from "../lib/sensei/sound";
import styles from "./dojo-sensei.module.css";

const frames: Record<Mood, [number, number, number, number]> = {
  idle: [80, 0, 360, 414],
  happy: [520, 0, 446, 414],
  thinking: [1033, 0, 450, 414],
  confused: [250, 503, 410, 410],
  encouraging: [792, 495, 480, 418],
};

function Robot({ mood }: { mood: Mood }) {
  const [x, y, width, height] = frames[mood];
  const style: CSSProperties = {
    aspectRatio: width / height,
    backgroundSize: `${(1536 / width) * 100}% ${(1024 / height) * 100}%`,
    backgroundPosition: `${(x / (1536 - width)) * 100}% ${(y / (1024 - height)) * 100}%`,
  };
  return (
    <span aria-hidden="true" className={styles.robot} style={style}>
      {mood === "idle" && <span className={styles.blink} />}
    </span>
  );
}

type Dialogue = {
  question: string;
  action: TutorAction;
  reply?: TutorReply;
  failed?: boolean;
};

const lessonActions: Record<TutorAction, string> = {
  explain: "Explain this in simpler words",
  similar: "Give me another example",
  steps: "Explain step by step",
  start: "Help me start",
  hint: "Give me a hint",
  wrong: "Explain my error",
  answer: "Quiz me on this lesson",
};

export function DojoSensei({
  prompt,
  feedback,
  reaction,
  openRequest = 0,
  onAssist,
  modelEnabled = false,
  labNote,
  lesson,
}: {
  prompt?: Prompt;
  feedback?: Feedback;
  reaction: Reaction;
  openRequest?: number;
  onAssist?: () => void;
  modelEnabled?: boolean;
  labNote?: string;
  lesson?: LessonTutor;
}) {
  const [panel, setPanel] = useState({ open: false, request: 0 });
  const open = panel.request !== openRequest || panel.open;
  const [expanded, setExpanded] = useState(false);
  const [dialogue, setDialogue] = useState<Dialogue>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "tutor"; text: string; code?: string }[]
  >([]);
  const history = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const audio = useSyncExternalStore(
    subscribeAudio,
    audioSnapshot,
    audioDefaults,
  );
  const shown =
    prompt && dialogue?.question === prompt.id ? dialogue : undefined;
  const pending = Boolean(shown && !shown.reply && !shown.failed);
  const mood =
    pending || (!feedback && shown?.reply && shown.action === "hint")
      ? "thinking"
      : shown?.failed
        ? "confused"
        : reaction.mood;
  const bubble = pending
    ? "Let me trace that with you."
    : !feedback && shown?.reply && shown.action === "hint"
      ? "Use the hint to trace one step at a time."
      : reaction.text;

  function toggle() {
    if (!open) {
      unlockAudio("open");
    } else {
      setExpanded(false);
      trigger.current?.focus();
    }
    setPanel({ open: !open, request: openRequest });
  }

  function append(message: (typeof messages)[number]) {
    setMessages((current) => [...current, message].slice(-80));
    requestAnimationFrame(() => {
      if (history.current)
        history.current.scrollTop = history.current.scrollHeight;
    });
  }

  function teach(message: string, action?: TutorAction) {
    if (!lesson) return;
    const detected =
      action ??
      (/quiz|test me|check my/i.test(message)
        ? "answer"
        : /error|wrong|failed|exception/i.test(message)
          ? "wrong"
          : /another|example/i.test(message)
            ? "similar"
            : /step|trace/i.test(message)
              ? "steps"
              : /hint|clue/i.test(message)
                ? "hint"
                : /start|begin/i.test(message)
                  ? "start"
                  : "explain");
    const replies: Record<TutorAction, TutorReply> = {
      explain: { text: lesson.simple },
      start: {
        text: "Start with the first worked example. Predict its output, run it, then change one value and compare.",
      },
      hint: { text: lesson.hint },
      steps: { text: lesson.steps },
      similar: {
        text:
          lesson.example.explanation +
          " This example prints " +
          lesson.example.output +
          ".",
        code: lesson.example.code,
      },
      wrong: {
        text:
          labNote ??
          "Run your code in DojoLab and select Explain Output with DojoSensei. Meanwhile, check this part of the lesson. " +
            lesson.hint,
      },
      answer: {
        text:
          "Try this question. " +
          lesson.question +
          " Use the lesson’s knowledge check to submit your answer.",
      },
    };
    append({ role: "user", text: message });
    append({ role: "tutor", ...replies[detected] });
    unlockAudio("reply");
  }

  async function ask(
    action: TutorAction,
    message: string = tutorActions[action],
  ) {
    if (!prompt || pending) return;
    unlockAudio("send");
    append({ role: "user", text: message });
    onAssist?.();
    const question = prompt.id;
    const generation = ++request.current;
    setDialogue({ question, action });
    try {
      const result =
        action === "wrong" && feedback
          ? {
              reply: {
                text: feedback.correct
                  ? `Your prediction was correct. ${feedback.explanation}`
                  : `${feedback.explanation} Compare that trace with your own to find where they diverge.`,
              },
            }
          : await getOutputHelp({ id: question, action });
      if (generation !== request.current) return;
      if ("error" in result) {
        setDialogue({ question, action, failed: true });
        append({ role: "tutor", text: result.error });
      } else {
        setDialogue({ question, action, reply: result.reply });
        append({ role: "tutor", ...result.reply });
        playSound("reply");
      }
    } catch {
      if (generation === request.current) {
        setDialogue({ question, action, failed: true });
        append({
          role: "tutor",
          text: "The connection failed. Try sending that again.",
        });
      }
    }
  }

  async function send() {
    const message = draft.trim();
    if (!message || (!prompt && !lesson) || pending) return;
    setDraft("");
    if (lesson) {
      teach(message);
      return;
    }
    if (!prompt) return;
    const intents: [RegExp, TutorAction][] = [
      [
        /correct answer|show (?:me )?(?:the )?(?:answer|solution)|what is the (?:answer|output)/i,
        "answer",
      ],
      [/wrong|incorrect|my answer/i, "wrong"],
      [/hint|clue/i, "hint"],
      [/another|similar|example/i, "similar"],
      [/step|trace|walk me/i, "steps"],
      [/start|study|practice next/i, "start"],
      [/this code|this operator|this line|what does .* mean/i, "explain"],
    ];
    const action = intents.find(([pattern]) => pattern.test(message))?.[1];
    if (action) {
      void ask(action, message);
      return;
    }
    const concepts: [RegExp, string][] = [
      [
        /\b(arrays?|lists?)\b/i,
        "An array or list stores values in order. In Python and JavaScript, index 0 is the first item. Try tracing which index each expression reads or updates.",
      ],
      [
        /\b(loops?|iteration)\b/i,
        "A loop repeats a block of code. Record the loop variable and any changing values on each pass. Check when the condition stops the loop.",
      ],
      [
        /\b(functions?|return)\b/i,
        "A function runs with the arguments supplied by its caller. The return statement gives a result back to the caller. Trace the function and the expression that uses its result separately.",
      ],
      [
        /\b(floor division|integer division)\b/i,
        "Python’s // operator divides and rounds toward negative infinity. For example, 7 // 2 is 3, while -7 // 2 is -4.",
      ],
      [
        /\b(modulo|remainder)\b/i,
        "In these exercises, % gives the remainder after division. For example, 7 % 2 is 1. That makes it useful for checking whether a positive integer is odd or even.",
      ],
    ];
    const curated = concepts.find(([pattern]) => pattern.test(message))?.[1];
    append({ role: "user", text: message });
    let reply = curated;
    if (!reply && modelEnabled) {
      const generation = ++request.current;
      const question = prompt.id;
      onAssist?.();
      setDialogue({ question, action: "explain" });
      try {
        reply =
          (await chatWithSensei({
            id: question,
            message,
            history: messages.slice(-8).map((turn) => ({
              role: turn.role === "user" ? "user" : "assistant",
              content: turn.text,
            })),
          })) ?? undefined;
      } catch {
        /* Use the local tutor guidance if the model is unavailable. */
      }
      if (generation !== request.current) return;
    }
    append({
      role: "tutor",
      text:
        reply ??
        "I can help with the current snippet and concepts like arrays, loops, and functions. Try asking for a hint, a step-by-step trace, or a similar example.",
    });
    setDialogue({
      question: prompt.id,
      action: "explain",
      reply: { text: reply ?? "" },
      failed: !reply,
    });
    unlockAudio("reply");
  }

  return (
    <aside
      className={styles.rail}
      id="practice-tutor"
      aria-label="Programming tutor"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          toggle();
        }
      }}
    >
      <div className={styles.dock}>
        <p className={styles.bubble} role="status">
          <span key={bubble}>{bubble}</span>
        </p>
        <button
          className={styles.trigger}
          type="button"
          ref={trigger}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <Robot mood={mood} />
          <span className={styles.badge}>
            {open ? "Close DojoSensei" : "Open DojoSensei"}
          </span>
        </button>
        <div
          id={panelId}
          className={styles.panel + (expanded ? " " + styles.fullscreen : "")}
          hidden={!open}
        >
          {open && (
            <>
              <div className={styles.header}>
                <h2>DojoSensei</h2>
                <p>
                  {modelEnabled
                    ? "Local model with rule-based guidance"
                    : "Rule-based programming tutor"}
                </p>
                <div className="actions">
                  <button
                    type="button"
                    className="button outline"
                    aria-pressed={expanded}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Exit fullscreen chat" : "Fullscreen chat"}
                  </button>
                  {expanded && (
                    <button
                      type="button"
                      className="button outline"
                      onClick={toggle}
                    >
                      Minimize tutor
                    </button>
                  )}
                </div>
              </div>
              {labNote && (
                <div className={styles.reply} role="status">
                  <strong>DojoLab explanation</strong>
                  <p>{labNote}</p>
                </div>
              )}
              {prompt || lesson ? (
                <>
                  <p className={styles.topic}>
                    Current topic{" "}
                    <strong>{lesson?.topic ?? prompt?.topic}</strong>
                  </p>
                  <details>
                    <summary>Suggested questions</summary>
                    <div
                      className={styles.actions}
                      aria-label="Tutor questions"
                      role="group"
                    >
                      {(Object.keys(tutorActions) as TutorAction[]).map(
                        (action) => (
                          <button
                            type="button"
                            key={action}
                            disabled={pending}
                            onClick={() =>
                              lesson
                                ? teach(lessonActions[action], action)
                                : void ask(action)
                            }
                          >
                            {lesson
                              ? lessonActions[action]
                              : tutorActions[action]}
                          </button>
                        ),
                      )}
                    </div>
                  </details>
                  <div
                    ref={history}
                    className={styles.chatHistory}
                    role="log"
                    aria-label="Conversation history"
                  >
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={
                          message.role === "user"
                            ? styles.userMessage
                            : styles.reply
                        }
                      >
                        <strong>
                          {message.role === "user" ? "You" : "DojoSensei"}
                        </strong>
                        <p>{message.text}</p>
                        {message.code && (
                          <pre tabIndex={0}>
                            <code>{message.code}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                    {pending && (
                      <span className={styles.typing}>Thinking…</span>
                    )}
                  </div>
                  <form
                    className={styles.composer}
                    onSubmit={(event) => {
                      event.preventDefault();
                      send();
                    }}
                  >
                    <textarea
                      aria-label="Message to DojoSensei"
                      placeholder="Ask DojoSensei anything about your code..."
                      rows={2}
                      maxLength={600}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      className="button"
                      disabled={pending || !draft.trim()}
                    >
                      Send
                    </button>
                    <button
                      className="button outline"
                      type="button"
                      disabled={!messages.length}
                      onClick={() => {
                        request.current++;
                        setMessages([]);
                        setDialogue(undefined);
                      }}
                    >
                      Clear conversation
                    </button>
                  </form>
                </>
              ) : (
                <p className={styles.reply}>
                  Start a session to ask for a hint, a step-by-step trace, or a
                  similar example.
                </p>
              )}
              <div className={styles.audio}>
                <button
                  type="button"
                  aria-pressed={!audio.enabled}
                  onClick={() => {
                    const enabled = !audio.enabled;
                    updateAudio({ ...audio, enabled });
                    if (enabled) unlockAudio("select");
                  }}
                >
                  {audio.enabled ? "Mute SFX" : "Unmute SFX"}
                </button>
                <label>
                  Volume{" "}
                  <input
                    aria-label="Sound effects volume"
                    type="range"
                    min={0}
                    max={100}
                    value={audio.volume}
                    onChange={(event) =>
                      updateAudio({
                        ...audio,
                        volume: Number(event.target.value),
                      })
                    }
                    onPointerUp={() => unlockAudio("select")}
                    onKeyUp={() => unlockAudio("select")}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
