import { courses } from "../academy/catalog.ts";

function escape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function offlineDocument() {
  const library = courses
    .map(
      (course) => `
    <section aria-labelledby="${course.id}">
      <h2 id="${course.id}">${course.language}</h2>
      ${course.modules
        .map(
          (module) => `
        <h3>${module.level}</h3>
        ${module.lessons
          .map(
            (lesson) => `
          <details>
            <summary>${escape(lesson.title)}</summary>
            <p>${escape(lesson.introduction)}</p>
            <p><strong>${escape(lesson.definition[0])}</strong> ${escape(lesson.definition[1])}</p>
            <pre><code>${escape(lesson.syntax)}</code></pre>
            <p>${escape(lesson.application)}</p>
            ${lesson.examples
              .map(
                (example) => `
              <h4>${escape(example.title)}</h4>
              <pre><code>${escape(example.code)}</code></pre>
              <p>Output</p>
              <pre><code>${escape(example.output)}</code></pre>
              <p>${escape(example.explanation)}</p>
            `,
              )
              .join("")}
            <p>${escape(lesson.summary)}</p>
          </details>
        `,
          )
          .join("")}
      `,
        )
        .join("")}
    </section>
  `,
    )
    .join("");

  // A single public document works without Next chunks, cookies, or fonts.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d1117">
<title>Offline Academy | CodeDojo</title>
<style>
:root{color-scheme:dark;font:1rem/1.6 system-ui,sans-serif;background:#0d1117;color:#f9fafb}
body{margin:0;padding:max(1.25rem,env(safe-area-inset-top)) max(1.25rem,env(safe-area-inset-right)) max(1.25rem,env(safe-area-inset-bottom)) max(1.25rem,env(safe-area-inset-left))}
main{max-width:46rem;margin:1.5rem auto}
.brand{font:bold 1rem monospace;color:#fbbf24}
h1{font-size:clamp(1.85rem,7vw,3rem);line-height:1.1}
a{color:#67e8f9;display:inline-block;padding:.55rem 0;margin-right:1rem}
section{margin-block:2rem}
summary{cursor:pointer;padding:.7rem;color:#f9fafb;font-weight:600}
details{border:1px solid #30363d;border-radius:.45rem;background:#161b22;margin-block:.55rem;padding:0 .65rem}
pre{overflow:auto;padding:.7rem;background:#0d1117;border:1px solid #30363d;color:#a5f3fc}
:focus-visible{outline:2px solid #67e8f9;outline-offset:3px}
</style>
</head>
<body>
<main>
  <div class="brand">&gt;_ CodeDojo</div>
  <h1>Offline Academy</h1>
  <p>Read Python and JavaScript lessons and worked examples offline. Reconnect to sign in, save progress, submit challenges, or use the full Academy and DojoLab.</p>
  <nav aria-label="Offline navigation">
    <a href="/">Return to CodeDojo</a>
    <a href="#python">Python</a>
    <a href="#javascript">JavaScript</a>
  </nav>
  ${library}
</main>
</body>
</html>`;
}
