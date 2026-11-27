"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  maxSource,
  maxOutput,
  sandboxDocument,
  startLab,
  type LabLanguage,
  type LabResult,
} from "../lib/lab/sandbox";
import { unlockAudio, playSound } from "../lib/sensei/sound";

const Monaco = dynamic(() => import("./lab-monaco"), {
  ssr: false,
  loading: () => <p>Loading desktop editor…</p>,
});
const desktop = "(min-width: 900px) and (pointer: fine)";
function subscribe(listener: () => void) {
  const media = matchMedia(desktop);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

const copy = (text: string) => navigator.clipboard.writeText(text);
const execLimit = 3000;
const startupLimit = 30000;

export function DojoLab({
  original,
  initialLanguage,
  onAssist,
  onExplain,
  expectedOutput,
}: {
  original: string;
  initialLanguage: LabLanguage;
  onAssist?: () => void;
  expectedOutput?: string;
  onExplain?: (value: {
    code: string;
    result: LabResult;
    language: LabLanguage;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(original);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(initialLanguage);
  const [result, setResult] = useState<LabResult>();
  const [phase, setPhase] = useState<"loading" | "running">();
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const latestRun = useRef({ code: original, language: initialLanguage });
  const stop = useRef<(() => void) | undefined>(undefined);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const expandedHeading = useRef<HTMLHeadingElement>(null);
  const editorIsDesktop = useSyncExternalStore(
    subscribe,
    () => matchMedia(desktop).matches,
    () => false,
  );

  useEffect(() => () => stop.current?.(), []);
  useEffect(() => {
    if (!expanded) return;
    expandedHeading.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        requestAnimationFrame(() => fullscreenButton.current?.focus());
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [expanded]);

  function run() {
    if (!code.trim() || code.length > maxSource || frame.current) return;
    onAssist?.();
    latestRun.current = { code, language };
    unlockAudio("run");
    setResult(undefined);
    setNotice("");
    setPhase("loading");
    const sandbox = document.createElement("iframe");
    sandbox.hidden = true;
    sandbox.title = "Isolated DojoLab runtime";
    sandbox.setAttribute("sandbox", "allow-scripts");
    sandbox.setAttribute("referrerpolicy", "no-referrer");
    let started = performance.now();
    let timeout = 0;
    function dispose() {
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      sandbox.remove();
      frame.current = null;
      stop.current = undefined;
    }
    function finish(output: LabResult) {
      dispose();
      setPhase(undefined);
      setResult(output);
      playSound(output.status === "success" ? "runDone" : "runError");
    }
    function arm(ms: number, message: string) {
      clearTimeout(timeout);
      timeout = window.setTimeout(
        () =>
          finish({
            status: "error",
            stdout: "",
            stderr: message,
            elapsed: performance.now() - started,
          }),
        ms,
      );
    }
    function receive(event: MessageEvent) {
      if (
        event.source !== sandbox.contentWindow ||
        event.origin !== "null" ||
        !event.data
      )
        return;
      const payload = event.data;
      if (payload.phase === "running") {
        started = performance.now();
        setPhase("running");
        arm(execLimit, "Execution reached the 3-second time limit.");
        return;
      }
      if (payload.status !== "success" && payload.status !== "error") return;
      finish({
        status: payload.status,
        stdout:
          typeof payload.stdout === "string"
            ? payload.stdout.slice(0, maxOutput)
            : "",
        stderr:
          typeof payload.stderr === "string"
            ? payload.stderr.slice(0, maxOutput + 500)
            : "",
        elapsed: performance.now() - started,
      });
    }
    frame.current = sandbox;
    stop.current = dispose;
    window.addEventListener("message", receive);
    sandbox.addEventListener(
      "load",
      () => startLab(sandbox, { code, language, input }),
      { once: true },
    );
    sandbox.srcdoc = sandboxDocument(language, location.origin);
    arm(
      startupLimit,
      "Runtime startup timed out. Python needs its public runtime files on first use.",
    );
    document.body.appendChild(sandbox);
  }

  function reset() {
    setCode(original);
    setLanguage(initialLanguage);
    setInput("");
    setResult(undefined);
  }

  async function copyText(value: string, what: string) {
    try {
      await copy(value);
      setNotice(what + " copied.");
    } catch {
      setNotice("Clipboard is unavailable. Select and copy the text manually.");
    }
  }

  const terminal = result
    ? [result.stdout.trimEnd(), result.stderr.trimEnd()]
        .filter(Boolean)
        .join("\n")
    : "";
  return (
    <section
      className={"lab" + (expanded ? " lab-fullscreen" : "")}
      aria-label="DojoLab playground"
    >
      <div className="actions lab-launch">
        <button
          className="button outline"
          type="button"
          onClick={() =>
            void copyText(original, onAssist ? "Question code" : "Example code")
          }
        >
          Copy Code
        </button>
        <button
          className="button outline"
          type="button"
          aria-expanded={open}
          onClick={() => {
            if (!open) setOpen(true);
            else if (!phase) setOpen(false);
          }}
          disabled={open && Boolean(phase)}
        >
          {open ? "Collapse DojoLab" : "Open in Playground"}
        </button>
      </div>
      <p role="status" className="muted">
        {notice}
      </p>
      {open && (
        <div className="card lab-panel">
          <h3 ref={expandedHeading} tabIndex={-1}>
            DojoLab
          </h3>
          <p className="muted">
            {onAssist && "Running code counts as assisted practice. "}Use{" "}
            {language === "Python" ? "input()" : "readline()"} for standard
            input.
          </p>
          <div className="actions">
            <label>
              Language{" "}
              <select
                value={language}
                disabled={Boolean(phase)}
                onChange={(event) =>
                  setLanguage(event.target.value as LabLanguage)
                }
              >
                <option>JavaScript</option>
                <option>Python</option>
              </select>
            </label>
            <button
              ref={fullscreenButton}
              className="button outline"
              type="button"
              aria-pressed={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Exit fullscreen" : "Fullscreen editor"}
            </button>
          </div>
          <div className="lab-editor">
            {editorIsDesktop ? (
              <Monaco value={code} language={language} onChange={setCode} />
            ) : (
              <textarea
                aria-label="Playground source code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                rows={9}
                maxLength={maxSource}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  const editor = event.currentTarget;
                  const start = editor.selectionStart;
                  const line = code.slice(0, start).split("\n").at(-1) ?? "";
                  const indentation = /^\s*/.exec(line)?.[0] ?? "";
                  if (!indentation && !/[:{]\s*$/.test(line)) return;
                  event.preventDefault();
                  const prefix =
                    "\n" + indentation + (/[:{]\s*$/.test(line) ? "  " : "");
                  setCode(
                    code.slice(0, start) +
                      prefix +
                      code.slice(editor.selectionEnd),
                  );
                  requestAnimationFrame(() =>
                    editor.setSelectionRange(
                      start + prefix.length,
                      start + prefix.length,
                    ),
                  );
                }}
              />
            )}
          </div>
          <label className="lab-input">
            Standard input{" "}
            <textarea
              rows={2}
              maxLength={4000}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          {code.length > maxSource && (
            <p role="alert">
              Source code must fit within {maxSource.toLocaleString()}{" "}
              characters.
            </p>
          )}
          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={run}
              disabled={
                Boolean(phase) || !code.trim() || code.length > maxSource
              }
            >
              Run Code
            </button>
            {phase && (
              <button
                className="button outline"
                type="button"
                onClick={() => {
                  stop.current?.();
                  setPhase(undefined);
                  setResult({
                    status: "stopped",
                    stdout: "",
                    stderr: "Stopped by you.",
                    elapsed: 0,
                  });
                }}
              >
                Stop Execution
              </button>
            )}
            <button
              className="button outline"
              type="button"
              disabled={Boolean(phase)}
              onClick={() => setCode("")}
            >
              Clear Code
            </button>
            <button
              className="button outline"
              type="button"
              disabled={Boolean(phase)}
              onClick={reset}
            >
              Reset Original Code
            </button>
          </div>
          <div className="lab-terminal">
            <h4>Output terminal</h4>
            {expectedOutput !== undefined && (
              <details>
                <summary>Expected sample output</summary>
                <pre>
                  <code>{expectedOutput}</code>
                </pre>
              </details>
            )}
            {expectedOutput !== undefined && result?.status === "success" && (
              <p role="status">
                {result.stdout.replace(/\r\n/g, "\n").trimEnd() ===
                expectedOutput.trimEnd()
                  ? "The output matches this sample."
                  : "The output is different from this sample. Compare the lines and try again."}
              </p>
            )}
            <p role="status">
              {phase === "loading"
                ? "Starting the isolated runtime…"
                : phase === "running"
                  ? "Running…"
                  : result
                    ? (result.status === "success"
                        ? "Execution complete"
                        : result.status === "error"
                          ? "Execution error"
                          : "Execution stopped") +
                      (result.elapsed
                        ? " · " + (result.elapsed / 1000).toFixed(2) + " s"
                        : "")
                    : "Run code to see its output."}
            </p>
            {result && (
              <pre tabIndex={0} aria-label="Execution output">
                <code>{terminal || "(no output)"}</code>
              </pre>
            )}
            {result && terminal && (
              <div className="actions">
                <button
                  className="button outline"
                  type="button"
                  onClick={() => void copyText(terminal, "Output")}
                >
                  Copy Output
                </button>
                {onExplain && (
                  <button
                    className="button outline"
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      onExplain({ ...latestRun.current, result });
                    }}
                  >
                    Explain Output with DojoSensei
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
