export const tutorActions = {
  start: "How do I start?",
  hint: "Give me a hint",
  explain: "Explain this code",
  steps: "Explain step by step",
  answer: "What is the answer?",
  wrong: "Why is my answer wrong?",
  similar: "Give me a similar example",
} as const;

export type TutorAction = keyof typeof tutorActions;
export type TutorReply = { text: string; code?: string };
export type Mood = "idle" | "happy" | "thinking" | "confused" | "encouraging";
export type Reaction = { mood: Mood; text: string };

export function practiceLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}
