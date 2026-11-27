export const languages = ["Python", "JavaScript"] as const;
export const difficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;
export const lengths = [10, 20, 50] as const;
export type Language = (typeof languages)[number];
export type Difficulty = (typeof difficulties)[number];
export type Length = (typeof lengths)[number];
export type Prompt = {
  id: string;
  topic: string;
  code: string;
  options: string[];
};
export type Feedback = {
  correct: boolean;
  answer: string;
  explanation: string;
  xp: number;
};
