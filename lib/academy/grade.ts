import type { Question } from "./types.ts";

export function gradeQuestions(questions: Question[], answers: number[]) {
  if (
    !questions.length ||
    answers.length !== questions.length ||
    answers.some(
      (answer, index) =>
        !Number.isInteger(answer) ||
        answer < 0 ||
        answer >= questions[index].options.length,
    )
  )
    return null;
  const review = questions.map((question, index) => ({
    correct: question.answer === answers[index],
    explanation: question.explanation,
  }));
  const correct = review.filter((answer) => answer.correct).length;
  const score = Math.round((correct / review.length) * 100);
  return { score, passed: correct * 5 >= review.length * 4, review };
}
