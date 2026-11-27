import { findQuestion } from "../output/bank.ts";
import type { TutorAction, TutorReply } from "./types.ts";

const strategies: Record<string, string> = {
  Precedence:
    "Mark the multiplication first, then write its result in the original expression.",
  Indexing:
    "Label the first element 0. Count up to the index inside the brackets.",
  Branching:
    "Calculate the remainder first. Follow only the branch that matches.",
  "Floor division": "Find how many complete groups the numerator contains.",
  Functions:
    "Substitute the argument for the parameter. Write down the return value before applying the operation in print.",
  Comprehensions:
    "List the range values, then apply the expression to each item before taking the sum.",
  Slicing:
    "Write the visited indices, starting at the start and adding the step. Stop before the upper bound.",
  "Dictionary defaults":
    "Keep one running count per key. A missing key starts at the fallback passed to get.",
  Exceptions: "Mark where execution jumps to the handler, then apply finally.",
  "Set intersection":
    "Circle values present in both sets. Only those values go into the sum.",
  Generators:
    "Cross off an item every time next is called. Sum can consume only what remains.",
  "Mutable defaults":
    "Draw one list for the default and a separate list for the explicit argument.",
  "Closure state":
    "Keep a running value through both calls. The second call sees the first call’s update.",
  "Recursive calls":
    "Make a column of arguments until you reach the base case, then add on the way back.",
  "Shallow copies":
    "Draw two outer objects and shared arrows to their nested objects. Distinguish mutation from replacement.",
  Descriptors:
    "Separate the value stored by the setter from the value returned by the getter.",
  "Cooperative inheritance":
    "Trace super() in the method resolution order, then apply the return expressions in reverse order.",
  "Generator delegation":
    "Separate yielded items from the delegated generator’s return value.",
  "Iterator aliasing":
    "Make pairs by pulling twice from the same sequence. An unmatched item creates no pair.",
  "Context manager suppression":
    "Trace what happens before the exception, what __exit__ returns, and where execution resumes.",
  "Array indexing":
    "Number the elements from 0, then look up the requested index.",
  Conditionals:
    "Work out whether the parity test is true. Use the matching side of the conditional expression.",
  "Loop accumulation":
    "Create a two-column trace for i and total. Update the total once per iteration.",
  "Function returns":
    "Trace the function call before adding anything in the surrounding expression.",
  "Map and filter":
    "Write the intermediate array after each operation. Start reduce at its explicit initial value.",
  "Rest destructuring":
    "Take the first element out of the list, then index the remaining list from zero again.",
  "Nullish coalescing":
    "Check whether each value is null or undefined. Zero does not trigger the fallback.",
  "Object spread":
    "Copy the properties in order. Later entries replace earlier keys in the copy.",
  "Switch fallthrough":
    "Start at the matching case and follow execution until a break.",
  "Generator consumption":
    "Track which values are consumed by next and which remain for the spread.",
  Recursion:
    "Count the positive arguments before the base case. Each contributes the same amount.",
  "Receiver binding":
    "For each call, identify the object used as this before reading its value.",
  "Prototype accessors":
    "Find the inherited getter, then evaluate it with the object that initiated the read.",
  "Sparse arrays":
    "Distinguish an empty slot from a value. Count only assigned keys.",
  "Promise ordering":
    "Trace the synchronous changes first, then process the queued callbacks in order.",
  "Private fields and static methods":
    "Read each instance’s private value from inside the class, then evaluate the formula.",
};

export function makeTutorReply(
  id: string,
  action: TutorAction,
): TutorReply | null {
  const question = findQuestion(id);
  if (!question) return null;
  const hint =
    strategies[question.topic] ??
    "Track each value as it changes, then substitute the current values into the print expression.";
  switch (action) {
    case "start":
      return {
        text: `Start with the final print expression. Find the values it reads, then trace how the earlier lines set them. Focus on ${question.topic.toLowerCase()}.`,
      };
    case "hint":
      return { text: hint };
    case "explain":
      return {
        text: `This ${question.language} question practices ${question.topic.toLowerCase()}. ${hint} Then evaluate the displayed expression using your trace.`,
      };
    case "steps":
      return {
        text: `1. Write the starting values.\n2. ${hint}\n3. Substitute the final values into the print expression and compare the result with your prediction.`,
      };
    case "answer":
      return {
        text: `The output is ${question.answer}. ${question.explanation}`,
      };
    case "similar": {
      const split = id.lastIndexOf("-");
      const nextId =
        id.slice(0, split + 1) + ((Number(id.slice(split + 1)) + 1) % 14);
      const sample = findQuestion(nextId);
      return {
        text: `Trace this ${question.topic.toLowerCase()} example using the same method. ${hint}`,
        code: sample?.code,
      };
    }
    case "wrong":
      return {
        text: "Check your answer first so I can help compare it with the actual output.",
      };
  }
}
