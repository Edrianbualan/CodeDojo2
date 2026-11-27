export type CourseId = "python" | "javascript";
export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Example = {
  title: string;
  code: string;
  output: string;
  explanation: string;
};
export type Exercise = {
  title: string;
  task: string;
  starter: string;
  expected: string;
  hint: string;
};
export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  objectives: string[];
  introduction: string;
  definition: [string, string];
  syntax: string;
  application: string;
  examples: [Example, Example];
  mistake: string;
  exercise: Exercise;
  question: Question;
  summary: string;
};
export type Module = { level: Level; lessons: Lesson[]; project: Exercise };
export type Course = {
  id: CourseId;
  language: "Python" | "JavaScript";
  description: string;
  modules: Module[];
};
export type Progress = {
  course_id: string;
  item_id: string;
  last_accessed_at: string;
  completed_at: string | null;
  best_score: number | null;
  attempts: number;
  xp: number;
};
export type LessonTutor = {
  id: string;
  topic: string;
  simple: string;
  steps: string;
  hint: string;
  example: Example;
  question: string;
};
