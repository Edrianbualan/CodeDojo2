import type { Course } from "../../lib/academy/types.ts";

export const javascript = {
  id: "javascript",
  language: "JavaScript",
  description:
    "Learn browser-language fundamentals, data transformations, classes, and asynchronous programs.",
  modules: [
    {
      level: "Beginner",
      lessons: [
        {
          slug: "hello",
          title: "Meet JavaScript and the console",
          minutes: 8,
          objectives: [
            "Distinguish the language from its runtime",
            "Write and read console output",
          ],
          introduction:
            "JavaScript first appeared in browsers in 1995. It now runs in browsers, server runtimes such as Node.js, and tools like DojoLab. The runtime provides its own APIs. A browser page has document, but a DojoLab worker does not. Basic expressions and console.log work in either context.",
          definition: [
            "Runtime",
            "The environment that executes code and supplies APIs like console, timers, or the browser document.",
          ],
          syntax:
            "Use console.log(value) to display a value. Quote string values. Write // before a line comment, or wrap a longer note in /* and */.",
          application:
            "Developers use JavaScript to respond to clicks, validate fields, and prepare data for display.",
          examples: [
            {
              title: "Print a greeting",
              code: "console.log('Hello, Dojo!');",
              output: "Hello, Dojo!",
              explanation: "The console receives a text value.",
            },
            {
              title: "Log an expression",
              code: "// Calculate two bonuses\nconsole.log(3 + 4);",
              output: "7",
              explanation:
                "The comment is ignored and the expression is evaluated.",
            },
          ],
          mistake:
            "An unquoted greeting is read as a variable name. Put literal text in quotes.",
          exercise: {
            title: "Add a status line",
            task: "Print Ready and 8 on separate lines.",
            starter: "console.log('Ready');\n// Print 8 on the next line",
            expected: "Ready\n8",
            hint: "Use a second console.log call.",
          },
          question: {
            prompt: "What supplies APIs such as document?",
            options: ["A variable declaration", "The runtime", "A comment"],
            answer: 1,
            explanation:
              "The language defines JavaScript itself. The browser runtime supplies document.",
          },
          summary: "Use the console to observe values one step at a time.",
        },
        {
          slug: "values",
          title: "Bindings, primitive types, and input",
          minutes: 13,
          objectives: [
            "Choose between const and let",
            "Convert strings and check for NaN",
          ],
          introduction:
            "A binding gives a value a name. Use const when you will not reassign the name and let when you will. Common primitive values include strings, numbers, booleans, null and undefined. DojoLab's readline() returns text or null at the end of input.",
          definition: [
            "NaN",
            "A special number value meaning a numeric calculation or conversion failed. Number.isNaN checks for it.",
          ],
          syntax:
            "Write const name = expression or let name = expression. Number(text) converts a numeric string, and String(value) converts a value to text. Use typeof to inspect basic types.",
          application:
            "Prices read from a form usually arrive as text and need conversion before addition.",
          examples: [
            {
              title: "Convert before adding",
              code: "const text = '12';\nconsole.log(Number(text) + 3);",
              output: "15",
              explanation:
                "Without Number, + would concatenate the text and digit.",
            },
            {
              title: "Track a changing value",
              code: "let count = 2;\ncount += 3;\nconsole.log(count, typeof count);",
              output: "5 number",
              explanation: "let allows reassignment and typeof reports number.",
            },
          ],
          mistake:
            "Reassigning a const binding throws an error. Use let for a changing counter.",
          exercise: {
            title: "Double user input",
            task: "Enter 6 in Standard input. Convert the line and print its double.",
            starter:
              "const line = readline();\n// Convert and double the number",
            expected: "12",
            hint: "Use Number(line) * 2.",
          },
          question: {
            prompt: "What is Number('banana')?",
            options: ["0", "undefined", "NaN"],
            answer: 2,
            explanation: "This string cannot be converted into a number.",
          },
          summary:
            "Choose const by default and convert input at the boundary of the program.",
        },
        {
          slug: "operators",
          title: "Operators and strict comparisons",
          minutes: 11,
          objectives: [
            "Calculate remainders and compound conditions",
            "Use strict equality",
          ],
          introduction:
            "Arithmetic combines numeric values. JavaScript also uses + for string concatenation, so input types matter. Comparisons return booleans. Strict equality avoids hidden conversion, making it easier to predict the result.",
          definition: [
            "Strict equality",
            "The === operator compares values without converting between types.",
          ],
          syntax:
            "Use ===, !==, >= and <= to compare. Use && when all requirements must hold, || when one is sufficient, and ! to negate a boolean.",
          application:
            "Team allocation uses remainder, and eligibility forms often combine multiple checks.",
          examples: [
            {
              title: "Compare without coercion",
              code: "console.log(5 === '5');\nconsole.log(5 === Number('5'));",
              output: "false\ntrue",
              explanation:
                "The first pair has different types. The second conversion makes both values numbers.",
            },
            {
              title: "Check a remainder",
              code: "const count = 14;\nconsole.log(count % 3);\nconsole.log(count > 10 && count % 2 === 0);",
              output: "2\ntrue",
              explanation:
                "Four groups of three leave two, and fourteen satisfies both tests.",
            },
          ],
          mistake:
            "The operator = assigns a value. Use === in a condition when you intend to compare.",
          exercise: {
            title: "Check eligibility",
            task: "Print true when the score reaches 10 and the practice session is finished.",
            starter:
              "const score = 12;\nconst finished = true;\n// Log the combined condition",
            expected: "true",
            hint: "Combine score >= 10 and finished with &&.",
          },
          question: {
            prompt: "Which expression is true?",
            options: ["3 === '3'", "false || false", "3 % 2 === 1"],
            answer: 2,
            explanation: "Three divided into groups of two leaves one.",
          },
          summary:
            "Watch the types, use strict comparisons, and write each condition clearly.",
        },
        {
          slug: "flow",
          title: "Branches, for loops, and while loops",
          minutes: 15,
          objectives: [
            "Use if and else if for overlapping conditions",
            "Trace loop bounds",
          ],
          introduction:
            "A branch is chosen by a condition. JavaScript surrounds the condition with parentheses and uses braces for the body. A for loop includes setup, a condition, and an update. A while loop is useful when only the changing condition determines when to stop.",
          definition: [
            "Block",
            "A group of statements inside braces. let and const names are scoped to their block.",
          ],
          syntax:
            "Use if (test) { ... } else { ... }. Use for (let i = 0; i < count; i++) for fixed repetitions. A while loop must have a reachable stopping condition.",
          application:
            "Use a loop to scan records or branch when a score crosses a threshold.",
          examples: [
            {
              title: "Choose a message",
              code: "const points = 90;\nif (points >= 90) {\n  console.log('Gold');\n} else if (points >= 70) {\n  console.log('Silver');\n} else {\n  console.log('Bronze');\n}",
              output: "Gold",
              explanation: "The first matching branch runs.",
            },
            {
              title: "Trace a for loop",
              code: "let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total += i;\n}\nconsole.log(total);",
              output: "6",
              explanation: "The loop runs with i equal to one, two, and three.",
            },
          ],
          mistake:
            "An index loop over an array usually uses i < array.length. Using <= tries to read a position past the end.",
          exercise: {
            title: "Count down",
            task: "Use while to print 3, 2, and 1 on separate lines, then stop.",
            starter: "let remaining = 3;\n// Add a while loop",
            expected: "3\n2\n1",
            hint: "Log remaining when it is positive, then decrement it.",
          },
          question: {
            prompt: "How many times does for (let i = 0; i < 3; i++) run?",
            options: ["Three", "Four", "Two"],
            answer: 0,
            explanation: "The condition succeeds for 0, 1, and 2.",
          },
          summary:
            "Use braces and trace the condition to avoid unreachable branches or infinite loops.",
        },
      ],
      project: {
        title: "Unit-price calculator",
        task: "Compute 4 items at 6 each, apply a discount of 3 if the subtotal is at least 20, and print 21. Try a smaller subtotal too.",
        starter:
          "const count = 4;\nconst unitPrice = 6;\n// Compute subtotal and discount",
        expected: "21",
        hint: "Multiply first, then check the threshold.",
      },
    },
    {
      level: "Intermediate",
      lessons: [
        {
          slug: "arrays",
          title: "Arrays, strings, and transformations",
          minutes: 14,
          objectives: [
            "Read positional data and slices",
            "Transform arrays with map and filter",
          ],
          introduction:
            "Arrays contain ordered elements. Strings have indexed characters but cannot change in place. Array methods can produce transformed arrays without changing the original. filter keeps matching items and map returns one transformed result per input item.",
          definition: [
            "Callback",
            "A function passed to another function. A method like map calls the callback for each element.",
          ],
          syntax:
            "Use array[0] for the first item, slice(start, end) to copy a range, map(fn) to transform, and filter(fn) to select.",
          application:
            "An events page might filter cancelled items and extract each visible event's title.",
          examples: [
            {
              title: "Index and slice text",
              code: "const word = 'Dojo';\nconsole.log(word[0]);\nconsole.log(word.slice(1, 3));",
              output: "D\noj",
              explanation:
                "The slice starts at index one and ends before three.",
            },
            {
              title: "Filter then map",
              code: "const values = [1, 2, 3, 4];\nconst selected = values.filter(value => value % 2 === 0);\nconsole.log(selected.map(value => value * 3).join(', '));",
              output: "6, 12",
              explanation:
                "The filter keeps 2 and 4. The map triples each one.",
            },
          ],
          mistake:
            "Do not expect map to drop values. Use filter when the length should shrink.",
          exercise: {
            title: "Build a practice list",
            task: "Print the squared values greater than 2 separated by a comma and space.",
            starter:
              "const values = [1, 2, 3, 4];\nconst result = [];\nconsole.log(result.join(', '));",
            expected: "9, 16",
            hint: "Filter the original number with value > 2 before squaring.",
          },
          question: {
            prompt: "Which method keeps only matching elements?",
            options: ["map", "filter", "join"],
            answer: 1,
            explanation:
              "filter runs a test and keeps the items for which it is true.",
          },
          summary:
            "Select with filter, transform with map, and join when you need display text.",
        },
        {
          slug: "records",
          title: "Objects, sets, and maps",
          minutes: 14,
          objectives: [
            "Read object properties",
            "Choose a map or set for keyed and unique data",
          ],
          introduction:
            "Objects group named properties. Sets keep unique values, while Maps store a value for each key and offer size directly. An object is often useful for a known shape such as a task. A Map fits dynamic counts keyed by a value.",
          definition: [
            "Property",
            "A named value on an object. Access it with a dot or with a bracketed key.",
          ],
          syntax:
            "Use object.name for a known property and object[key] for a variable key. Use new Set(items), map.get(key), and map.set(key, value).",
          application:
            "Task records group related fields, and a map can count votes per option.",
          examples: [
            {
              title: "Read two fields",
              code: "const task = { title: 'Read', done: false };\nconst key = 'title';\nconsole.log(task[key], task.done);",
              output: "Read false",
              explanation:
                "The bracket uses the key variable. The dot reads the literal done property.",
            },
            {
              title: "Count unique keys",
              code: "const tags = new Set(['loops', 'loops', 'arrays']);\nconst scores = new Map([['Ari', 4]]);\nconsole.log(tags.size, scores.get('Ari'));",
              output: "2 4",
              explanation:
                "The Set removes duplicates. The Map looks up Ari's score.",
            },
          ],
          mistake:
            "task.key refers to a property literally named key. Use task[key] when key contains the desired name.",
          exercise: {
            title: "Count repeated words",
            task: "Create a Map that records 2 for dojo and print that count.",
            starter:
              "const words = ['dojo', 'lab', 'dojo'];\nconst counts = new Map();\n// Update counts in a loop\nconsole.log(counts.get('dojo'));",
            expected: "2",
            hint: "Use (counts.get(word) ?? 0) + 1 as the next count.",
          },
          question: {
            prompt: "Which collection removes duplicate primitive values?",
            options: ["Map", "Object", "Set"],
            answer: 2,
            explanation: "A Set keeps one entry per distinct primitive value.",
          },
          summary:
            "Use objects for records, sets for uniqueness, and maps for changing key–value lookups.",
        },
        {
          slug: "functions",
          title: "Functions, scope, and closures",
          minutes: 15,
          objectives: [
            "Pass arguments and return reusable values",
            "Explain which names a closure remembers",
          ],
          introduction:
            "Functions turn a sequence of instructions into reusable behavior. A parameter receives an argument from the caller. A closure is a function together with access to the variables in its surrounding scope, even when called later.",
          definition: [
            "Closure",
            "A function that retains access to bindings from the scope where it was created.",
          ],
          syntax:
            "Use function name(argument) { return expression; } or const name = argument => expression. Declare block-scoped values with const or let.",
          application:
            "A counter or configurable price formatter can remember its own state or settings.",
          examples: [
            {
              title: "Return a number",
              code: "function total(price, count) {\n  return price * count;\n}\nconsole.log(total(4, 3));",
              output: "12",
              explanation:
                "The caller passes two arguments and receives the computed result.",
            },
            {
              title: "Keep private state in a closure",
              code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next());",
              output: "1 2",
              explanation:
                "Both calls access the count created by the same factory call.",
            },
          ],
          mistake:
            "An arrow function with braces needs an explicit return. A concise arrow without braces returns its expression.",
          exercise: {
            title: "Create a formatter factory",
            task: "Return a function that adds the supplied prefix to text. Log tag('Dojo: ')('Ready').",
            starter:
              "function tag(prefix) {\n  return text => text;\n}\nconsole.log(tag('Dojo: ')('Ready'));",
            expected: "Dojo: Ready",
            hint: "Return an arrow that uses prefix + text.",
          },
          question: {
            prompt: "What does a closure keep access to?",
            options: [
              "Only global variables",
              "Bindings from its creation scope",
              "Every caller's local variables",
            ],
            answer: 1,
            explanation:
              "The function closes over bindings from the scope where it was defined.",
          },
          summary:
            "Return values for reuse and trace the scope that owns each variable.",
        },
        {
          slug: "errors-modules",
          title: "Errors, modules, and structured data",
          minutes: 14,
          objectives: [
            "Handle errors with try/catch",
            "Explain JavaScript module boundaries",
          ],
          introduction:
            "JavaScript throws exceptions when some operations fail. Catch the failures you can handle and give a clear message. Modules let files expose only the values their callers need. DojoLab runs a single snippet, so examples here use functions and JSON in one file while showing how a real project would split the code.",
          definition: [
            "Module",
            "A file with its own scope that can export values for other files to import.",
          ],
          syntax:
            "Use try { ... } catch (error) { ... } for recoverable failures. A real ES module can use export function parse() and another file can use import { parse } from './parser.js'. JSON.parse reads JSON text.",
          application:
            "A settings tool can keep parsing logic in one module and pass validated data to a display component.",
          examples: [
            {
              title: "Catch a JSON error",
              code: "try {\n  JSON.parse('not JSON');\n} catch (error) {\n  console.log(error.name);\n}",
              output: "SyntaxError",
              explanation:
                "Invalid JSON throws a syntax error before it returns a value.",
            },
            {
              title: "Parse valid data",
              code: 'function parseSettings(text) {\n  return JSON.parse(text);\n}\nconsole.log(parseSettings(\'{"theme":"dark"}\').theme);',
              output: "dark",
              explanation:
                "The string becomes an object, and the property reads the theme.",
            },
          ],
          mistake:
            "JSON requires double quotes around keys and strings. A JavaScript object literal is not always valid JSON.",
          exercise: {
            title: "Recover from malformed settings",
            task: "For invalid text, catch the failure and print Invalid settings.",
            starter:
              "const text = '{oops}';\n// Parse in a try block and handle the error",
            expected: "Invalid settings",
            hint: "Place JSON.parse(text) inside try and log the message in catch.",
          },
          question: {
            prompt: "Which statement exposes a function from an ES module?",
            options: [
              "export function parse() {}",
              "console.log(parse)",
              "const parse = null",
            ],
            answer: 0,
            explanation:
              "export makes the declared function available to imports.",
          },
          summary:
            "Catch specific failures near the boundary and use module exports to make responsibilities clear.",
        },
      ],
      project: {
        title: "Study queue builder",
        task: "Keep the unfinished records and print their titles on separate lines. Try an all-complete collection too.",
        starter:
          "const tasks = [{title:'Read', done:true}, {title:'Run', done:false}, {title:'Review', done:false}];\n// Filter and print this queue",
        expected: "Run\nReview",
        hint: "Use filter with !task.done and a loop to print titles.",
      },
    },
    {
      level: "Advanced",
      lessons: [
        {
          slug: "classes",
          title: "Classes, instances, and inheritance",
          minutes: 16,
          objectives: [
            "Construct instances with independent state",
            "Extend a parent class",
          ],
          introduction:
            "JavaScript classes describe how to create instances and which methods they share. The receiving object is usually this in an ordinary method call. A subclass extends a parent and can use super to call its constructor or methods.",
          definition: [
            "Constructor",
            "The method called when new creates an instance.",
          ],
          syntax:
            "Write class Name { constructor(value) { this.value = value; } }. Use class Child extends Parent for inheritance. In a subclass constructor, call super before using this.",
          application:
            "Classes can model devices, tasks, and other objects that carry a changing state.",
          examples: [
            {
              title: "Separate object state",
              code: "class Counter {\n  constructor(value) { this.value = value; }\n  add(amount) { this.value += amount; }\n}\nconst a = new Counter(2);\nconst b = new Counter(6);\na.add(3);\nconsole.log(a.value, b.value);",
              output: "5 6",
              explanation: "Each object has a separate value field.",
            },
            {
              title: "Extend a method",
              code: "class Task { label() { return 'Task'; } }\nclass Urgent extends Task {\n  label() { return 'Urgent ' + super.label(); }\n}\nconsole.log(new Urgent().label());",
              output: "Urgent Task",
              explanation:
                "The child method extends the result returned by the parent.",
            },
          ],
          mistake:
            "Extracting a method and calling it separately can lose its receiver. Use obj.method() or explicitly bind this.",
          exercise: {
            title: "Construct a learner",
            task: "Update the constructor so the last line prints Ari.",
            starter:
              "class Learner {\n  constructor(name) { /* set the property */ }\n}\nconsole.log(new Learner('Ari').name);",
            expected: "Ari",
            hint: "Assign this.name = name in the constructor.",
          },
          question: {
            prompt: "What does new normally create?",
            options: [
              "A new instance",
              "A new unrelated global variable",
              "A string with the class name",
            ],
            answer: 0,
            explanation: "new creates an instance and calls the constructor.",
          },
          summary:
            "Attach changes to the correct instance and keep inheritance focused on shared behavior.",
        },
        {
          slug: "async",
          title: "Promises and async/await",
          minutes: 17,
          objectives: [
            "Handle a promise that settles",
            "Trace work across await",
          ],
          introduction:
            "A promise represents a future result. It can fulfill with a value or reject with an error. An async function always returns a promise. await pauses that function until the value is ready while other work can continue. DojoLab supports asynchronous snippets without relying on external network access.",
          definition: [
            "Fulfillment",
            "A promise's successful completion with a value.",
          ],
          syntax:
            "Use await promise inside an async function or DojoLab snippet. Put await inside try if you need to catch a rejection. Promise.all waits for multiple operations and returns results in input order.",
          application:
            "Applications await data reads, staged calculations, or animation steps.",
          examples: [
            {
              title: "Wait for a value",
              code: "async function total() {\n  const price = await Promise.resolve(7);\n  return price * 2;\n}\nconsole.log(await total());",
              output: "14",
              explanation:
                "The function waits for the resolved value before multiplying.",
            },
            {
              title: "Handle rejection",
              code: "try {\n  await Promise.reject(new Error('Unavailable'));\n} catch (error) {\n  console.log(error.message);\n}",
              output: "Unavailable",
              explanation:
                "A rejected promise at await behaves like a thrown error.",
            },
          ],
          mistake:
            "Logging the return of an async function directly logs a promise, not its final value. Await it before using the result.",
          exercise: {
            title: "Combine two results",
            task: "Await both promises in order and print their sum.",
            starter:
              "const values = [Promise.resolve(8), Promise.resolve(4)];\n// Await both values before adding",
            expected: "12",
            hint: "Use await Promise.all(values), then destructure the resulting array.",
          },
          question: {
            prompt: "What does an async function always return?",
            options: ["A string", "A promise", "An array"],
            answer: 1,
            explanation: "An async function wraps its result in a promise.",
          },
          summary:
            "Follow the promise until it settles, handle failures, and await values before using them.",
        },
        {
          slug: "algorithms",
          title: "Reduce, sorting, and testing edge cases",
          minutes: 17,
          objectives: [
            "Build a result bit by bit",
            "Test a sort or aggregation on small and empty inputs",
          ],
          introduction:
            "An accumulator holds the partial answer while you process items. reduce updates it once per element. A sorting comparator says which item should come first. Start with an explicit initial value and test an empty collection before trying larger input.",
          definition: [
            "Comparator",
            "A function that returns a negative, zero, or positive number to describe ordering.",
          ],
          syntax:
            "Use array.reduce((sum, item) => sum + item, 0). For numeric sorting use [...items].sort((a, b) => a - b) to preserve the original array.",
          application:
            "Dashboards compute totals and sort records by scores or prices.",
          examples: [
            {
              title: "Sum with reduce",
              code: "const values = [3, 4, 5];\nconsole.log(values.reduce((sum, value) => sum + value, 0));",
              output: "12",
              explanation:
                "The accumulator starts at zero and receives each updated sum.",
            },
            {
              title: "Sort prices numerically",
              code: "const prices = [12, 3, 8];\nconsole.log([...prices].sort((a, b) => a - b).join(', '));",
              output: "3, 8, 12",
              explanation:
                "The comparator uses numeric difference. The spread creates a shallow copy to sort.",
            },
          ],
          mistake:
            "Default sort compares strings, so 12 can come before 3. Give a comparator when ordering numbers.",
          exercise: {
            title: "Find the largest unique score",
            task: "Remove duplicates, sort numbers from highest to lowest, and print the first.",
            starter:
              "const scores = [8, 12, 4, 12];\n// Choose a Set and a descending comparator",
            expected: "12",
            hint: "Convert a Set back to an array and use (a, b) => b - a.",
          },
          question: {
            prompt: "Why give reduce an initial 0 when summing?",
            options: [
              "It handles an empty array and defines the starting sum",
              "It sorts numbers first",
              "It skips the first element",
            ],
            answer: 0,
            explanation:
              "With an initial value, an empty sum is zero and each input item is included.",
          },
          summary:
            "Choose a clear starting value and test the smallest possible input.",
        },
      ],
      project: {
        title: "Async score report",
        task: "Await the scores, sum them with reduce, and print the average 8. Think through an empty input.",
        starter:
          "const scores = [Promise.resolve(6), Promise.resolve(10)];\n// Await the scores and compute their average",
        expected: "8",
        hint: "Use Promise.all to get an array of values, then reduce with an initial zero.",
      },
    },
  ],
} satisfies Course;
