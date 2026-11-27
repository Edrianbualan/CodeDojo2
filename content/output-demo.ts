export const examples = [
  {
    language: "Python",
    file: "practice.py",
    lines: [
      "def double(number):",
      "    return number * 2",
      "",
      "print(double(3) + 1)",
    ],
    options: ["6", "7", "8"],
    correct: "7",
    explanation: "double(3) returns 6. Adding 1 gives 7.",
  },
  {
    language: "JavaScript",
    file: "practice.js",
    lines: [
      "const scores = [2, 4, 6];",
      "const first = scores[0];",
      "",
      "console.log(first + scores[2]);",
    ],
    options: ["6", "8", "10"],
    correct: "8",
    explanation:
      "JavaScript arrays start at index 0. The first and third values are 2 and 6.",
  },
] as const;
