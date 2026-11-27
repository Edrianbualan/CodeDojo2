import type { CourseId, Question } from "../../lib/academy/types.ts";

const q = (
  prompt: string,
  options: [string, string, string],
  answer: number,
  explanation: string,
): Question => ({ prompt, options, answer, explanation });

export const assessments: Record<
  CourseId,
  { modules: Question[][]; final: Question[] }
> = {
  python: {
    modules: [
      [
        q(
          "What does print(int('8') + 4) display?",
          ["84", "12", "A type error"],
          1,
          "int converts the text into a number before addition.",
        ),
        q(
          "Which expression checks that n is odd and greater than 10?",
          [
            "n % 2 == 0 and n > 10",
            "n % 2 == 1 or n > 10",
            "n % 2 == 1 and n > 10",
          ],
          2,
          "Odd integers leave remainder 1 when divided by 2. Both conditions are required.",
        ),
        q(
          "How many iterations are in range(4, 7)?",
          ["Three", "Four", "Seven"],
          0,
          "The visited numbers are 4, 5, and 6.",
        ),
        q(
          "Which branch runs first if a score of 96 satisfies both score >= 60 and score >= 90?",
          [
            "Both blocks",
            "Whichever matching clause appears first",
            "The highest threshold automatically",
          ],
          1,
          "An if/elif chain evaluates in source order and stops on the first match.",
        ),
      ],
      [
        q(
          "What is len(set([3, 3, 7]))?",
          ["1", "3", "2"],
          2,
          "The set contains only 3 and 7.",
        ),
        q(
          "Which expression reads the last value in a nonempty list?",
          ["values[-1]", "values[len(values)]", "values[0]"],
          0,
          "Negative one counts back one position from the end.",
        ),
        q(
          "A function prints 10 and reaches its end without return. What does the caller receive?",
          ["10", "None", "An empty string"],
          1,
          "Printing does not set a return value. The default is None.",
        ),
        q(
          "Which import lets you call ceil(2.1) without writing math.ceil?",
          ["import math", "import ceil from math", "from math import ceil"],
          2,
          "This syntax imports ceil directly into the current scope.",
        ),
      ],
      [
        q(
          "Where should a constructor store a per-instance name?",
          ["self.name", "A local variable named name only", "A comment"],
          0,
          "Assigning self.name saves the attribute on the current instance.",
        ),
        q(
          "Which code selects even values without changing them?",
          [
            "[n * 2 for n in nums]",
            "[n for n in nums if n % 2 == 0]",
            "[n for n in nums if n % 2 == 1]",
          ],
          1,
          "The expression leaves n unchanged. The filter keeps even values.",
        ),
        q(
          "An override needs the parent implementation. Which expression calls the parent method?",
          ["label()", "self.label()", "super().label()"],
          2,
          "super() finds the next implementation through the class hierarchy.",
        ),
        q(
          "What does a with open(...) block do when it ends?",
          ["Closes the file resource", "Deletes the file", "Renames the file"],
          0,
          "The file context manager handles cleanup.",
        ),
      ],
    ],
    final: [
      q(
        "What value does bool('False') produce?",
        ["False", "None", "True"],
        2,
        "A nonempty string is truthy, regardless of its spelling.",
      ),
      q(
        "What does sum(range(2, 5)) return?",
        ["9", "14", "7"],
        0,
        "The included values are 2, 3, and 4.",
      ),
      q(
        "Which collection fits a fixed pair of coordinates?",
        ["An empty set", "A two-item tuple", "A boolean"],
        1,
        "The coordinate pair needs two ordered positions and does not need mutation.",
      ),
      q(
        "How should a function make a calculated total available to its caller?",
        ["Write a comment", "Add a global variable", "Return the total"],
        2,
        "A return value travels back to the calling expression.",
      ),
      q(
        "Which operator reads the price field of an object named ticket?",
        ["ticket.price", "ticket(price)", "ticket / price"],
        0,
        "Dot notation reads the named attribute.",
      ),
      q(
        "What happens to a DojoLab Python file after a new run starts?",
        [
          "It is uploaded",
          "The next run starts with a fresh virtual filesystem",
          "It is stored in your account",
        ],
        1,
        "The isolated runner creates a fresh environment for each run.",
      ),
    ],
  },
  javascript: {
    modules: [
      [
        q(
          "What does console.log('10' + 2) display?",
          ["12", "102", "NaN"],
          1,
          "The string causes + to concatenate.",
        ),
        q(
          "Which binding fits a counter incremented in a loop?",
          ["let", "const", "A comment"],
          0,
          "let permits reassignment when the counter changes.",
        ),
        q(
          "What is the result of 8 === '8'?",
          ["8", "true", "false"],
          2,
          "Strict equality requires matching types.",
        ),
        q(
          "What condition visits each array index starting at zero?",
          ["i <= items.length", "i < items.length", "i === items.length"],
          1,
          "Indexes end at length minus one.",
        ),
      ],
      [
        q(
          "Which method transforms each item into its squared value?",
          ["map", "filter", "slice"],
          0,
          "map produces one transformed result per item.",
        ),
        q(
          "Which expression reads the property named by the variable field?",
          ["record.field", "field.record", "record[field]"],
          2,
          "Bracket notation evaluates field and uses it as the key.",
        ),
        q(
          "A closure increments a local counter each time you call it. Why does the count persist?",
          [
            "It saves to the browser",
            "It retains access to the scope where it was created",
            "It changes the arguments of the caller",
          ],
          1,
          "The returned function still refers to the captured binding.",
        ),
        q(
          "What should catch handle around JSON.parse?",
          ["Malformed input", "Valid results only", "An array index"],
          0,
          "Invalid JSON throws an exception during parsing.",
        ),
      ],
      [
        q(
          "Which expression makes a subclass reuse the parent constructor?",
          ["this()", "super()", "new this"],
          1,
          "A subclass constructor calls super before accessing this.",
        ),
        q(
          "What does await Promise.resolve(9) evaluate to?",
          ["9", "An unresolved Promise", "undefined"],
          0,
          "await obtains the fulfilled value.",
        ),
        q(
          "Which comparator sorts numeric scores from highest to lowest?",
          ["(a, b) => a - b", "() => 0", "(a, b) => b - a"],
          2,
          "Subtracting in reverse order puts larger values first.",
        ),
        q(
          "What does [].reduce((sum, n) => sum + n, 0) return?",
          ["undefined", "0", "NaN"],
          1,
          "No callback runs, so the explicit starting accumulator is returned.",
        ),
      ],
    ],
    final: [
      q(
        "Which statement about DojoLab JavaScript is accurate?",
        [
          "It runs inside a browser worker",
          "It uses your web page’s document",
          "It runs on the production database",
        ],
        0,
        "DojoLab has a separate worker with its own runtime environment.",
      ),
      q(
        "Which expression checks that points is at least 80 and done is true?",
        ["points >= 80 || done", "points && 80", "points >= 80 && done"],
        2,
        "&& requires both conditions to hold.",
      ),
      q(
        "Which method can remove cancelled events from an array?",
        ["map", "filter", "join"],
        1,
        "filter keeps the items that pass a predicate.",
      ),
      q(
        "Which collection can track one count per arbitrary key?",
        ["Map", "Set", "A string"],
        0,
        "Map stores values under keys and lets you update each count.",
      ),
      q(
        "Where do errors from rejected promises go if you use await inside try?",
        [
          "They disappear",
          "They go to console.log by default",
          "The catch block",
        ],
        2,
        "await turns the rejection into an exception in the surrounding async code.",
      ),
      q(
        "Which implementation preserves the original order of the source array when sorting a report?",
        ["items.sort()", "[...items].sort(compare)", "items.reverse()"],
        1,
        "The spread makes an array copy, so sort changes only the copy.",
      ),
    ],
  },
};
