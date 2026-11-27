"use client";

import { useState } from "react";

import { examples } from "../content/output-demo";

const codeToken = /(\b(?:def|return|const)\b|\b\d+\b)/g;

function ExampleLine({ line }: { line: string }) {
  return (line || " ").split(codeToken).map((part, index) =>
    index % 2 === 0 ? (
      part
    ) : (
      <span
        className={/^\d/.test(part) ? "token-number" : "token-keyword"}
        key={index}
      >
        {part}
      </span>
    ),
  );
}

export function CodePreview() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const exercise = examples[index];

  return (
    <div className="terminal" id="start" tabIndex={-1}>
      <div className="terminal-head">
        <span aria-hidden="true">▰ ▰ ▰</span>
        <span>{exercise.file}</span>
        <span>Try a sample</span>
      </div>
      <div className="terminal-body">
        <label className="language">
          Language{" "}
          <select
            value={index}
            onChange={(event) => {
              setIndex(Number(event.target.value));
              setAnswer("");
              setSubmitted(false);
            }}
          >
            {examples.map((example, position) => (
              <option key={example.language} value={position}>
                {example.language}
              </option>
            ))}
          </select>
        </label>
        <pre aria-label={`${exercise.language} code example`}>
          <code>
            {exercise.lines.map((line, position) => (
              <span className="line" key={position}>
                <span className="line-number" aria-hidden="true">
                  {position + 1}
                </span>
                <ExampleLine line={line} />
              </span>
            ))}
          </code>
        </pre>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <fieldset>
            <legend>What does this code print?</legend>
            <div className="options">
              {exercise.options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="output"
                    value={option}
                    checked={answer === option}
                    onChange={() => {
                      setAnswer(option);
                      setSubmitted(false);
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button compact" type="submit" disabled={!answer}>
            Check answer
          </button>
          <p className="feedback" role="status">
            {submitted
              ? `${answer === exercise.correct ? "Correct." : `The answer is ${exercise.correct}.`} ${exercise.explanation}`
              : ""}
          </p>
        </form>
      </div>
    </div>
  );
}
