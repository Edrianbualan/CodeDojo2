"use client";

import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";

loader.config({ monaco });
(
  globalThis as typeof globalThis & { MonacoEnvironment?: unknown }
).MonacoEnvironment = {
  getWorker: () => new Worker(new URL("./monaco.worker.ts", import.meta.url)),
};

export default function LabMonaco({
  value,
  language,
  onChange,
}: {
  value: string;
  language: string;
  onChange: (value: string) => void;
}) {
  return (
    <Editor
      height="17rem"
      theme="vs-dark"
      language={language.toLowerCase()}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      options={{
        ariaLabel: "Playground source code",
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        autoIndent: "full",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        fontSize: 14,
        accessibilitySupport: "auto",
      }}
    />
  );
}
