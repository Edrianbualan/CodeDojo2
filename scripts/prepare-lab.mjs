import { copyFile, mkdir } from "node:fs/promises";

const source = new URL("../node_modules/pyodide/", import.meta.url);
const output = new URL("../public/lab-runtime/", import.meta.url);
await mkdir(output, { recursive: true });
for (const name of [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
]) {
  await copyFile(new URL(name, source), new URL(name, output));
}
