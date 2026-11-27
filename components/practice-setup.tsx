"use client";

import Form from "next/form";
import { useState } from "react";
import { bankCapacity } from "../lib/output/config";
import { difficulties } from "../lib/output/types";

const tracks = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "HTML",
  "CSS",
  "PHP",
  "SQL",
];
const symbols = ["C", "C++", "JV", "PY", "JS", "<>", "#", "PHP", "DB"];
const descriptions = [
  "Expressions and control flow",
  "Collections and transformations",
  "State and language behavior",
  "Advanced runtime details",
];

export function PracticeSetup() {
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [quantity, setQuantity] = useState("10");
  const [custom, setCustom] = useState(15);
  const [mode, setMode] = useState("choice");
  const [timer, setTimer] = useState(false);
  const [random, setRandom] = useState(true);
  const [sound, setSound] = useState(false);
  const [tutor, setTutor] = useState(true);
  const playable = language === "Python" || language === "JavaScript";
  const length = quantity === "custom" ? String(custom) : quantity;
  return (
    <Form className="training-grid" action="/practice/output">
      <div className="training-options">
        <fieldset className="card training-card">
          <legend>Programming language</legend>
          <div className="training-choices languages">
            {tracks.map((value, index) => (
              <label key={value}>
                <input
                  type="radio"
                  name="language"
                  value={value}
                  checked={language === value}
                  onChange={() => setLanguage(value)}
                />
                <span className="training-symbol" aria-hidden="true">
                  {symbols[index]}
                </span>
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="card training-card">
          <legend>Practice category</legend>
          {playable ? (
            <p className="training-category">Predict the Output</p>
          ) : (
            <p role="status">
              There is no playable question bank for {language} yet. Choose
              Python or JavaScript to train today.
            </p>
          )}
        </fieldset>
        <fieldset className="card training-card" disabled={!playable}>
          <legend>Difficulty</legend>
          <div className="training-choices">
            {difficulties.map((value, index) => (
              <label key={value}>
                <input
                  type="radio"
                  name="difficulty"
                  value={value}
                  checked={difficulty === value}
                  onChange={() => setDifficulty(value)}
                />
                <strong>{value}</strong>
                <small>{descriptions[index]}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset
          className="card training-card training-controls"
          disabled={!playable}
        >
          <legend>Session settings</legend>
          <label>
            Question quantity{" "}
            <select
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            >
              {[5, 10, 20, 30, 50].map((count) => (
                <option key={count} value={count}>
                  {count} questions
                </option>
              ))}
              <option value="unlimited">Unlimited practice</option>
              <option value="custom">Custom quantity</option>
            </select>
          </label>
          {quantity === "custom" && (
            <label>
              Custom quantity (1–{bankCapacity}){" "}
              <input
                type="number"
                min={1}
                max={bankCapacity}
                required
                value={custom || ""}
                onChange={(event) => setCustom(Number(event.target.value))}
              />
            </label>
          )}
          <input type="hidden" name="length" value={length} />
          <label>
            Answer format{" "}
            <select
              name="mode"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="choice">Multiple choice</option>
              <option value="written">Written answer</option>
              <option value="mixed">Mixed mode</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={timer}
              onChange={(event) => setTimer(event.target.checked)}
            />{" "}
            Set time limit
          </label>
          {timer ? (
            <label>
              Time limit in minutes{" "}
              <input
                name="minutes"
                type="number"
                min={1}
                max={180}
                defaultValue={15}
                required
              />
            </label>
          ) : (
            <input type="hidden" name="minutes" value="0" />
          )}
          <label>
            <input
              type="checkbox"
              checked={random}
              onChange={(event) => setRandom(event.target.checked)}
            />{" "}
            Randomize questions
          </label>
          <label>
            <input
              type="checkbox"
              checked={sound}
              onChange={(event) => setSound(event.target.checked)}
            />{" "}
            Sound effects
          </label>
          <label>
            <input
              type="checkbox"
              checked={tutor}
              onChange={(event) => setTutor(event.target.checked)}
            />{" "}
            Tutor assistance
          </label>
          <input type="hidden" name="random" value={random ? "on" : "off"} />
          <input type="hidden" name="sound" value={sound ? "on" : "off"} />
          <input type="hidden" name="tutor" value={tutor ? "on" : "off"} />
        </fieldset>
      </div>
      <aside className="card training-summary">
        <h2>Training summary</h2>
        <p>
          {language} · {difficulty}
        </p>
        <p>
          {quantity === "unlimited"
            ? "Unlimited practice"
            : length + " questions"}{" "}
          ·{" "}
          {mode === "choice"
            ? "Multiple choice"
            : mode === "written"
              ? "Written answer"
              : "Mixed mode"}
        </p>
        <p>
          {timer ? "Timed" : "Untimed"} · {random ? "Shuffled" : "Ordered"} ·{" "}
          {tutor ? "Tutor on" : "Tutor off"} ·{" "}
          {sound ? "Sound on" : "Sound off"}
        </p>
        <button className="button" disabled={!playable}>
          Start Training
        </button>
      </aside>
    </Form>
  );
}
