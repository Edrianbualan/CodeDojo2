export const maxSource = 24_000;
export const maxOutput = 8_000;
export type LabLanguage = "JavaScript" | "Python";
export type LabResult = {
  status: "success" | "error" | "stopped";
  stdout: string;
  stderr: string;
  elapsed: number;
};

function execute() {
  self.addEventListener(
    "message",
    async ({ data }) => {
      const { code, input, language, runtime } = data;
      const publish = self.postMessage.bind(self);
      const start = performance.now();
      let stdout = "";
      let stderr = "";
      let remaining = 8000;
      const lines =
        input === "" ? [] : input.replace(/\r\n/g, "\n").split("\n");
      const read = () => lines.shift();
      const render = (value: unknown) => {
        if (typeof value === "string") return value;
        try {
          return JSON.stringify(value) ?? String(value);
        } catch {
          return String(value);
        }
      };
      function write(channel: string, ...values: unknown[]) {
        if (!remaining) return;
        const line = values.slice(0, 50).map(render).join(" ") + "\n";
        const text = line.slice(0, remaining);
        remaining -= text.length;
        if (channel === "error") stderr += text;
        else stdout += text;
        if (!remaining) stderr += "\n[Output limit reached]\n";
      }
      try {
        if (language === "Python") {
          (
            self as unknown as { importScripts(url: string): void }
          ).importScripts(runtime + "/pyodide.js");
          const python = await (
            self as unknown as {
              loadPyodide: (options: unknown) => Promise<{
                runPythonAsync(code: string): Promise<unknown>;
                setStdin(options: unknown): void;
              }>;
            }
          ).loadPyodide({
            indexURL: runtime + "/",
            stdout: (line: string) => write("out", line),
            stderr: (line: string) => write("error", line),
            jsglobals: Object.create(null),
            fullStdLib: false,
          });
          python.setStdin({ stdin: read });
          publish({ phase: "running" });
          await python.runPythonAsync(code);
        } else {
          publish({ phase: "running" });
          const run = Object.getPrototypeOf(async function () {}).constructor;
          const console = {
            log: (...values: unknown[]) => write("out", ...values),
            info: (...values: unknown[]) => write("out", ...values),
            warn: (...values: unknown[]) => write("error", ...values),
            error: (...values: unknown[]) => write("error", ...values),
          };
          await run(
            "console",
            "readline",
            '"use strict";\n' + code,
          )(console, () => read() ?? null);
        }
        publish({
          status: "success",
          stdout,
          stderr,
          elapsed: performance.now() - start,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.name + ": " + error.message
            : render(error);
        publish({
          status: "error",
          stdout,
          stderr: (stderr + "\n" + message).slice(0, 8500),
          elapsed: performance.now() - start,
        });
      }
    },
    { once: true },
  );
}

function bridge(workerSource: string) {
  const host = parent;
  let started = false;
  addEventListener("message", ({ source, data }) => {
    if (source !== host || data?.type !== "dojolab-run" || started) return;
    started = true;
    const url = URL.createObjectURL(
      new Blob([workerSource], { type: "text/javascript" }),
    );
    const worker = new Worker(url);
    let running = false;
    worker.onmessage = (event) => {
      const value = event.data;
      if (value?.phase === "running" && !running) {
        running = true;
        host.postMessage({ phase: "running" }, "*");
        return;
      }
      if (value?.status !== "success" && value?.status !== "error") return;
      worker.terminate();
      URL.revokeObjectURL(url);
      host.postMessage(
        {
          status: value.status,
          stdout:
            typeof value.stdout === "string" ? value.stdout.slice(0, 8000) : "",
          stderr:
            typeof value.stderr === "string" ? value.stderr.slice(0, 8500) : "",
        },
        "*",
      );
    };
    worker.onerror = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
      host.postMessage(
        {
          status: "error",
          stdout: "",
          stderr: "The browser runtime could not start.",
          elapsed: 0,
        },
        "*",
      );
    };
    worker.postMessage(data);
  });
}

export function sandboxDocument(language: LabLanguage, origin: string) {
  // A sandboxed srcdoc without allow-same-origin gives the worker an opaque origin.
  // The blob worker inherits the frame CSP. Python can read only these public runtime assets.
  const pythonRuntime = new URL("/lab-runtime", origin).href;
  const pythonScripts = ["/pyodide.js", "/pyodide.asm.js"]
    .map((file) => pythonRuntime + file)
    .join(" ");
  const pythonFiles = [
    "/pyodide.asm.wasm",
    "/python_stdlib.zip",
    "/pyodide-lock.json",
  ]
    .map((file) => pythonRuntime + file)
    .join(" ");
  const policy =
    "default-src 'none'; base-uri 'none'; form-action 'none'; worker-src blob:; " +
    "script-src 'unsafe-inline' 'unsafe-eval' blob:" +
    (language === "Python" ? " " + pythonScripts : "") +
    "; connect-src " +
    (language === "Python" ? pythonFiles : "'none'");
  const script =
    "(" +
    bridge.toString() +
    ")(" +
    JSON.stringify("(" + execute.toString() + ")()") +
    ");";
  return (
    '<!doctype html><meta http-equiv="Content-Security-Policy" content="' +
    policy +
    '"><script>' +
    script +
    "</script>"
  );
}

export function startLab(
  frame: HTMLIFrameElement,
  request: { code: string; language: LabLanguage; input: string },
) {
  frame.contentWindow?.postMessage(
    {
      ...request,
      runtime: new URL("/lab-runtime", location.origin).href,
      type: "dojolab-run",
    },
    "*",
  );
}
