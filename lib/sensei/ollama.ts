import "server-only";

export function ollamaEnabled() {
  return (
    process.env.TUTOR_PROVIDER === "ollama" && Boolean(process.env.OLLAMA_MODEL)
  );
}

export async function askOllama(
  context: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
) {
  if (!ollamaEnabled()) return null;
  try {
    const origin = new URL(
      process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    );
    if (
      origin.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) ||
      origin.username ||
      origin.password
    )
      return null;
    const response = await fetch(new URL("/api/chat", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        stream: false,
        options: { num_predict: 240 },
        messages: [
          {
            role: "system",
            content:
              "You are CodeDojo's programming tutor for learners. Explain programming in clear language. Stay on topic and guide the learner with hints. Leave the exact output for CodeDojo’s explicit answer action. Here is the current exercise:\n" +
              context,
          },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.message?.content;
    return typeof text === "string" && text.trim()
      ? text.trim().slice(0, 1600)
      : null;
  } catch {
    return null;
  }
}
