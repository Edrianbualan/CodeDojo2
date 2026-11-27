import type { LabLanguage, LabResult } from "./sandbox";

export function explainLab(
  language: LabLanguage,
  code: string,
  result: LabResult,
) {
  if (result.status === "stopped")
    return "You stopped this run. Run it again when you’re ready.";
  if (result.status === "error") {
    if (/time limit|timed out/i.test(result.stderr))
      return "The run ran out of time. Check whether your loop condition can become false or whether a recursive call can reach its base case.";
    if (/SyntaxError|IndentationError/.test(result.stderr))
      return "The runtime found a syntax problem. Check the line named in the terminal for missing punctuation, unmatched brackets, or indentation.";
    if (/NameError|ReferenceError/.test(result.stderr))
      return "A name was used before the runtime knew its value. Check the spelling and where the variable is declared.";
    if (/EOFError/.test(result.stderr))
      return "An input call reached the end of standard input. Add one line for each input call.";
    if (/TypeError/.test(result.stderr))
      return "An operation received a value of the wrong type. Trace the operands and function arguments and check each value’s type.";
    return "Start with the last line of the error. It describes what failed. Then use the line number or traceback above it to find the expression.";
  }
  const print = language === "Python" ? "print()" : "console.log()";
  if (!result.stdout.trim())
    return (
      "The run completed without standard output. Add " +
      print +
      " to inspect a value or the result of an expression."
    );
  const lineCount = result.stdout.trimEnd().split("\n").length;
  const hint = /\b(for|while)\b/.test(code)
    ? "Write down the loop variable and any updated value on each pass. Match each printed line to the iteration that produced it."
    : "Find the first " +
      print +
      " in your code and trace the values it receives. Change one input or variable and run it again to compare.";
  return (
    "This " +
    language +
    " run printed " +
    lineCount +
    (lineCount === 1 ? " line. " : " lines. ") +
    hint
  );
}
