import type { Course } from "../../lib/academy/types.ts";

export const python = {
  id: "python",
  language: "Python",
  description:
    "From your first script to classes, file handling, and data projects.",
  modules: [
    {
      level: "Beginner",
      lessons: [
        {
          slug: "hello",
          title: "Meet Python and print your first program",
          minutes: 8,
          objectives: [
            "Explain what Python does",
            "Run a script and inspect its output",
          ],
          introduction:
            "Guido van Rossum first released Python in 1991. Python is used for automation, science, data analysis and web services. An interpreter reads your source and runs each instruction. Try changing one value at a time so you can connect each change to the output.",
          definition: [
            "Expression",
            "Code that produces a value, such as 2 + 3.",
          ],
          syntax:
            "Write print(value) to display a value. Put text in quotes. A # outside a string starts a comment that ends at the line break.",
          application:
            "A short script can turn a daily report into a reusable procedure.",
          examples: [
            {
              title: "Your first greeting",
              code: "print('Hello, Dojo!')",
              output: "Hello, Dojo!",
              explanation: "print writes its text on one line.",
            },
            {
              title: "Comments and math",
              code: "# Add two practice sessions\nprint(2 + 3)",
              output: "5",
              explanation:
                "The comment is skipped, and Python adds before displaying the result.",
            },
          ],
          mistake:
            "print(Hello) looks for a name called Hello. Use quotes when you mean literal text.",
          exercise: {
            title: "Name tag",
            task: "Print Academy on one line and 7 on the next.",
            starter: "print('Academy')\n# Print 7 here",
            expected: "Academy\n7",
            hint: "Use a second print call.",
          },
          question: {
            prompt: "Which line is ignored by the interpreter?",
            options: ["print(2)", "# explain the next line", "print('#')"],
            answer: 1,
            explanation: "A # outside quotes begins a comment.",
          },
          summary:
            "Use quotes for text, parentheses for arguments, and comments for notes.",
        },
        {
          slug: "values",
          title: "Variables, types, conversion, and input",
          minutes: 13,
          objectives: [
            "Store and inspect values",
            "Convert text into a number",
          ],
          introduction:
            "Assignment connects a name to a value. Integers are whole numbers, floats represent decimal values, strings hold text, and booleans are True and False. The type determines what operations do. Adding strings joins them while adding numbers computes a sum.",
          definition: [
            "Conversion",
            "Constructing a value of another type, such as converting '12' into 12.",
          ],
          syntax:
            "Use name = value to assign. input() returns text even when someone types digits. Use int(), float(), or str() to convert before calculating.",
          application:
            "Text inputs for inventory, prices, and temperatures need conversion before arithmetic.",
          examples: [
            {
              title: "Convert before adding",
              code: "text = '12'\nprint(int(text) + 3)",
              output: "15",
              explanation: "The conversion turns digits into a whole number.",
            },
            {
              title: "Inspect a value",
              code: "ready = True\nprint(type(ready).__name__)",
              output: "bool",
              explanation:
                "type identifies the type, and __name__ gives its name.",
            },
          ],
          mistake:
            "int('4.5') raises ValueError. float('4.5') keeps the fractional part.",
          exercise: {
            title: "Team size",
            task: "Enter 5 in Standard input. Read it and print 7 after adding two mentors.",
            starter: "size = input()\n# Convert and add",
            expected: "7",
            hint: "Pass size to int before adding.",
          },
          question: {
            prompt: "What does input() return when someone types 5?",
            options: ["An integer", "A boolean", "A string"],
            answer: 2,
            explanation:
              "input reads text. Conversion is a separate operation.",
          },
          summary:
            "Give values descriptive names and convert raw input before treating it as a number.",
        },
        {
          slug: "operators",
          title: "Arithmetic, comparisons, and logic",
          minutes: 12,
          objectives: [
            "Calculate with arithmetic operators",
            "Combine conditions",
          ],
          introduction:
            "Arithmetic operators compute numbers. Comparisons produce booleans. Logical operators combine comparisons into a rule. Use parentheses when a reader might otherwise be unsure which operation happens first.",
          definition: [
            "Remainder",
            "The amount left over after dividing into whole groups. The % operator finds it.",
          ],
          syntax:
            "Use +, -, *, /, //, %, and ** for arithmetic. Use == and != for equality tests. Use and, or, and not for logical checks.",
          application:
            "Calculate team sizes and decide whether someone meets more than one entry requirement.",
          examples: [
            {
              title: "Whole groups and leftovers",
              code: "print(17 // 5)\nprint(17 % 5)",
              output: "3\n2",
              explanation:
                "There are three whole groups of five, with two left.",
            },
            {
              title: "Combine rules",
              code: "score = 82\nsubmitted = True\nprint(score >= 75 and submitted)",
              output: "True",
              explanation: "Both requirements are true.",
            },
          ],
          mistake: "A single = assigns a value. Use == to compare values.",
          exercise: {
            title: "Event admission",
            task: "Print True when age is at least 13 and permission is true.",
            starter: "age = 15\npermission = True\n# Print the condition",
            expected: "True",
            hint: "Join age >= 13 and permission with and.",
          },
          question: {
            prompt: "What is 5 + 2 * 3?",
            options: ["21", "11", "15"],
            answer: 1,
            explanation: "Multiplication happens first, so 5 + 6 gives 11.",
          },
          summary:
            "Group calculations clearly and build complex rules from small comparisons.",
        },
        {
          slug: "branches",
          title: "Decisions with if, elif, and else",
          minutes: 11,
          objectives: ["Choose a branch", "Trace the first matching condition"],
          introduction:
            "Conditionals let code choose different instructions depending on a value. Python checks if first, then checks elif clauses in order. When one succeeds, Python runs its indented block and skips the remaining branches.",
          definition: [
            "Branch",
            "A block of code chosen based on a condition or a fallback.",
          ],
          syntax:
            "Write if condition: then indent the body. Align elif condition: and else: with the if. else has no condition.",
          application:
            "A grading tool can choose messages based on a numeric score.",
          examples: [
            {
              title: "Pass or retry",
              code: "score = 76\nif score >= 75:\n    print('Pass')\nelse:\n    print('Try again')",
              output: "Pass",
              explanation:
                "The first test succeeds, so the else block is skipped.",
            },
            {
              title: "Multiple thresholds",
              code: "temp = 17\nif temp >= 25:\n    print('Warm')\nelif temp >= 15:\n    print('Mild')\nelse:\n    print('Cool')",
              output: "Mild",
              explanation: "The first condition fails and the second succeeds.",
            },
          ],
          mistake:
            "Checking score >= 60 before score >= 90 catches high scores early. Put the most specific threshold first.",
          exercise: {
            title: "Assign a badge",
            task: "Print Gold for 90 or above, Silver for 70 or above, and Bronze otherwise.",
            starter: "points = 90\n# Add the three branches",
            expected: "Gold",
            hint: "Test the highest threshold first.",
          },
          question: {
            prompt: "When does else run?",
            options: [
              "When all earlier branches fail",
              "After every true if",
              "When its own condition is true",
            ],
            answer: 0,
            explanation:
              "else is the fallback and does not have its own condition.",
          },
          summary:
            "Order overlapping conditions carefully and indent their bodies.",
        },
        {
          slug: "loops",
          title: "Repeat work with for and while",
          minutes: 14,
          objectives: ["Iterate with range", "Update a while condition safely"],
          introduction:
            "Use for to visit a collection or range. Use while when repetition depends on a changing condition. Trace the variables at the start and end of each iteration to see when a loop stops.",
          definition: ["Iteration", "One pass through the body of a loop."],
          syntax:
            "for n in range(start, stop): excludes stop. while condition: repeats while its test is true. Update the value tested in a while loop or use break.",
          application:
            "Loops add up scores, check each item in a list, and repeat menus.",
          examples: [
            {
              title: "Sum a range",
              code: "total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)",
              output: "6",
              explanation: "The loop adds 1, 2, and 3.",
            },
            {
              title: "Count down",
              code: "remaining = 3\nwhile remaining > 0:\n    print(remaining)\n    remaining -= 1",
              output: "3\n2\n1",
              explanation: "At zero, the condition becomes false.",
            },
          ],
          mistake:
            "A while loop without a state update may never stop. Check that every path can reach the exit.",
          exercise: {
            title: "Number guessing game",
            task: "For guesses 3, 9, and 7, print Too low, Too high, and Correct on separate lines. Stop on the match.",
            starter: "secret = 7\nfor guess in [3, 9, 7]:\n    pass",
            expected: "Too low\nToo high\nCorrect",
            hint: "Use if, elif, and else, then break after the correct guess.",
          },
          question: {
            prompt: "Which values does range(2, 5) produce?",
            options: ["2, 3, 4, 5", "1, 2, 3, 4", "2, 3, 4"],
            answer: 2,
            explanation: "range includes the start and excludes the stop.",
          },
          summary:
            "Choose for for known collections and while for changing conditions.",
        },
      ],
      project: {
        title: "Temperature converter",
        task: "Convert 20 °C to Fahrenheit and print 68. Try 0 °C after the sample passes.",
        starter: "celsius = 20\nfahrenheit = 0\nprint(fahrenheit)",
        expected: "68",
        hint: "Multiply by 9 / 5 and add 32. Convert to an integer for this whole-number sample.",
      },
    },
    {
      level: "Intermediate",
      lessons: [
        {
          slug: "sequences",
          title: "Strings, lists, and tuples",
          minutes: 13,
          objectives: [
            "Read indexes and slices",
            "Choose between mutable and immutable sequences",
          ],
          introduction:
            "Strings, lists, and tuples store items in order. Positions begin at zero. Lists can change in place, whereas strings and tuples cannot. A slice extracts a range of positions into a new sequence.",
          definition: [
            "Mutable",
            "Able to change in place. A list is mutable, but a string and a tuple are immutable.",
          ],
          syntax:
            "Use sequence[0] to read the first item and sequence[a:b] for a slice ending before b. Use [] for lists and (3, 4) for a tuple.",
          application:
            "A shopping list can grow. A coordinate pair fits a tuple because it represents a fixed pair of values.",
          examples: [
            {
              title: "Slice text",
              code: "word = 'Python'\nprint(word[0])\nprint(word[1:4])",
              output: "P\nyth",
              explanation: "The slice reads positions 1, 2, and 3.",
            },
            {
              title: "Update a list and unpack a tuple",
              code: "colors = ['red', 'blue']\ncolors[1] = 'gold'\nx, y = (3, 4)\nprint(colors[1], x + y)",
              output: "gold 7",
              explanation:
                "List assignment changes the second element. Tuple unpacking binds positions to names.",
            },
          ],
          mistake:
            "sequence[len(sequence)] is outside the bounds. The last index is len(sequence) - 1, or use sequence[-1].",
          exercise: {
            title: "Revise a task list",
            task: "Replace the first task with review and print it.",
            starter: "tasks = ['read', 'run']\n# Change tasks[0] and print it",
            expected: "review",
            hint: "Assign to index zero.",
          },
          question: {
            prompt: "Which collection accepts assignment to an element?",
            options: ["Tuple", "List", "String"],
            answer: 1,
            explanation: "Lists support changing an element by index.",
          },
          summary:
            "Use indexes and slices deliberately. Choose a list when items need to change.",
        },
        {
          slug: "collections",
          title: "Sets and dictionaries",
          minutes: 12,
          objectives: [
            "Use sets for uniqueness",
            "Look up dictionary values safely",
          ],
          introduction:
            "A set keeps unique items. A dictionary stores key–value pairs. Use a set when membership matters, a dictionary when each key needs associated information, and a list when order or repeated values matter.",
          definition: [
            "Key",
            "A lookup identifier in a dictionary. Setting the same key again replaces its value.",
          ],
          syntax:
            "Use {1, 2} or set() for a set. Use {'name': 'Ari'} or {} for a dictionary. mapping.get(key, default) handles absent keys.",
          application:
            "A learning app can track unique visitors in a set and map each learner name to a count.",
          examples: [
            {
              title: "Count unique tags",
              code: "tags = {'loops', 'lists', 'loops'}\nprint(len(tags))\nprint('sets' in tags)",
              output: "2\nFalse",
              explanation:
                "Duplicates collapse. The membership test looks for the exact tag.",
            },
            {
              title: "Count attempts",
              code: "counts = {'run': 2}\ncounts['run'] = counts.get('run', 0) + 1\nprint(counts['run'])\nprint(counts.get('skip', 0))",
              output: "3\n0",
              explanation: "An absent key gets the fallback value.",
            },
          ],
          mistake: "{} creates a dictionary. Use set() for an empty set.",
          exercise: {
            title: "To-do list",
            task: "Mark Read as done, then print only the name of the unfinished task.",
            starter:
              "tasks = [{'name': 'Read', 'done': False}, {'name': 'Run', 'done': False}]\n# Update the first task, then print unfinished names",
            expected: "Run",
            hint: "Set tasks[0]['done'] = True, then use a loop and if not task['done'].",
          },
          question: {
            prompt: "Which call avoids KeyError for an absent key?",
            options: [
              "scores.get('Ari', 0)",
              "scores['Ari']",
              "scores.add('Ari')",
            ],
            answer: 0,
            explanation: "get returns the fallback if the key does not exist.",
          },
          summary:
            "Choose collections based on order, uniqueness, and lookup needs.",
        },
        {
          slug: "functions",
          title: "Functions, parameters, return values, and scope",
          minutes: 15,
          objectives: [
            "Define and call functions",
            "Explain local scope and return values",
          ],
          introduction:
            "A function names reusable work. Parameters are the local names a function receives. Arguments are the values a caller supplies. A return value can be used by other code, whereas printing simply displays a value.",
          definition: [
            "Scope",
            "The region where a name can be found. Parameters and assignments in a function normally create local names.",
          ],
          syntax:
            "Write def name(parameter): and indent the body. Use return expression to provide a result. A function without a return value gives None.",
          application:
            "A receipt, cart, and checkout page can share one pricing function.",
          examples: [
            {
              title: "Use a returned result",
              code: "def double(value):\n    return value * 2\n\nprint(double(6) + 1)",
              output: "13",
              explanation: "The caller receives 12 and adds one.",
            },
            {
              title: "Trace local scope",
              code: "rate = 10\ndef quote(quantity):\n    rate = 3\n    return rate * quantity\n\nprint(quote(2))\nprint(rate)",
              output: "6\n10",
              explanation: "The local rate does not replace the outer rate.",
            },
          ],
          mistake:
            "Printing a result inside a function does not return it. Return the value if the caller needs it.",
          exercise: {
            title: "Simple calculator",
            task: "Support '+' and '*' and print calculate(6, 7, '*'). Check that addition still works.",
            starter:
              "def calculate(a, b, operator):\n    if operator == '+':\n        return a + b\n    return 0\n\nprint(calculate(6, 7, '*'))",
            expected: "42",
            hint: "Check operator == '*' and return a * b.",
          },
          question: {
            prompt: "What is the parameter in def double(value)?",
            options: ["double(5)", "The result of the call", "value"],
            answer: 2,
            explanation: "value receives the caller's argument.",
          },
          summary:
            "Use clear parameters, keep temporary names local, and return results for reuse.",
        },
        {
          slug: "errors-modules",
          title: "Handle exceptions and use modules",
          minutes: 14,
          objectives: [
            "Catch a specific exception",
            "Import a standard library function",
          ],
          introduction:
            "An exception signals that an operation failed. A handler lets the program recover when it knows what to do. A module contains reusable Python code. The standard library has modules you can import without separately installing them.",
          definition: [
            "Exception handler",
            "An except block matched to a particular type of error.",
          ],
          syntax:
            "Put a risky operation inside try:. Catch the expected exception with except ValueError:. Use import math or from math import ceil.",
          application:
            "A form can reject non-numeric input, while a planning tool uses math.ceil to round a value up.",
          examples: [
            {
              title: "Recover from invalid input",
              code: "try:\n    number = int('oops')\nexcept ValueError:\n    number = 0\nprint(number)",
              output: "0",
              explanation:
                "The failed conversion jumps to the ValueError handler.",
            },
            {
              title: "Round up with math",
              code: "import math\nprint(math.ceil(4.2))",
              output: "5",
              explanation:
                "ceil chooses the smallest integer at least as large as the input.",
            },
          ],
          mistake:
            "A broad except can hide unrelated mistakes. Keep try blocks small and catch the error you expect.",
          exercise: {
            title: "Safe count converter",
            task: "Finish the handler so the invalid input prints Invalid count.",
            starter:
              "try:\n    print(int('bad'))\nexcept ValueError:\n    pass",
            expected: "Invalid count",
            hint: "Replace pass with a print call.",
          },
          question: {
            prompt: "Which exception does int('banana') raise?",
            options: ["IndexError", "ValueError", "KeyError"],
            answer: 1,
            explanation:
              "The conversion failed because the string's value cannot represent an integer.",
          },
          summary:
            "Recover from specific failures and reuse standard library tools where possible.",
        },
      ],
      project: {
        title: "Student grade calculator",
        task: "Average [80, 95, 95] and print Pass at 75 or higher. Try a below-threshold list too.",
        starter: "scores = [80, 95, 95]\nprint('Pending')",
        expected: "Pass",
        hint: "Use sum(scores) / len(scores) before comparing.",
      },
    },
    {
      level: "Advanced",
      lessons: [
        {
          slug: "objects",
          title: "Classes, objects, and inheritance",
          minutes: 16,
          objectives: [
            "Create instances with separate state",
            "Extend a parent method",
          ],
          introduction:
            "A class describes data and behavior that instances share. An instance is one object created from the class. Methods receive the current instance as self. A subclass can inherit methods and customize part of their behavior.",
          definition: [
            "Attribute",
            "A named value attached to an object and accessed with a dot.",
          ],
          syntax:
            "Declare class Name:. Create instance attributes in __init__(self, ...). Use class Child(Parent): to inherit and super() to call a parent method.",
          application:
            "Objects are useful for tasks, wallets, and other items with changing data and associated operations.",
          examples: [
            {
              title: "Separate object state",
              code: "class Counter:\n    def __init__(self, value):\n        self.value = value\n    def add(self, amount):\n        self.value += amount\n\na = Counter(2)\nb = Counter(6)\na.add(3)\nprint(a.value, b.value)",
              output: "5 6",
              explanation: "Only a changes. b keeps its own starting value.",
            },
            {
              title: "Override a method",
              code: "class Task:\n    def label(self):\n        return 'Task'\n\nclass UrgentTask(Task):\n    def label(self):\n        return 'Urgent ' + super().label()\n\nprint(UrgentTask().label())",
              output: "Urgent Task",
              explanation:
                "The subclass extends the result of the parent method.",
            },
          ],
          mistake:
            "Writing value = value in a constructor creates no instance field. Use self.value = value.",
          exercise: {
            title: "Model a learner",
            task: "Complete the constructor so the program prints Ari.",
            starter:
              "class Learner:\n    def __init__(self, name):\n        pass\n\nprint(Learner('Ari').name)",
            expected: "Ari",
            hint: "Assign name to self.name.",
          },
          question: {
            prompt: "What is self in an instance method?",
            options: [
              "The class definition",
              "The receiving object",
              "The returned value",
            ],
            answer: 1,
            explanation:
              "Python passes the object that received the method call as self.",
          },
          summary:
            "Group state and behavior in classes and specialize methods only where useful.",
        },
        {
          slug: "files",
          title: "Read and write files",
          minutes: 14,
          objectives: [
            "Use with for file cleanup",
            "Choose a read, write, or append mode",
          ],
          introduction:
            "Files keep data separate from running code. Opening a file returns an object you can read or write. A with block closes it when the block ends. DojoLab uses a temporary virtual filesystem, so create and read a file in the same run.",
          definition: [
            "Context manager",
            "An object that sets up a resource on entering a with block and cleans it up when leaving.",
          ],
          syntax:
            "Open a file with with open('note.txt', 'w', encoding='utf-8') as file:. Use 'r' to read or 'a' to append. write() adds exactly the text you provide.",
          application:
            "Programs can write reports, save notes, or read a text-based configuration file.",
          examples: [
            {
              title: "Write and read",
              code: "with open('note.txt', 'w', encoding='utf-8') as file:\n    file.write('Study loops')\nwith open('note.txt', encoding='utf-8') as file:\n    print(file.read())",
              output: "Study loops",
              explanation:
                "The writing block closes before the file is read back.",
            },
            {
              title: "Append a line",
              code: "with open('log.txt', 'w', encoding='utf-8') as file:\n    file.write('start\\n')\nwith open('log.txt', 'a', encoding='utf-8') as file:\n    file.write('finish')\nwith open('log.txt', encoding='utf-8') as file:\n    print(file.read())",
              output: "start\nfinish",
              explanation: "Append preserves the existing line.",
            },
          ],
          mistake:
            "Opening an existing file with 'w' replaces its contents. Use 'a' to preserve earlier text.",
          exercise: {
            title: "Save a checklist",
            task: "Write practice to the temporary file and print it back.",
            starter:
              "with open('checklist.txt', 'w', encoding='utf-8') as file:\n    pass\nwith open('checklist.txt', encoding='utf-8') as file:\n    print(file.read())",
            expected: "practice",
            hint: "Use file.write('practice') in the first block.",
          },
          question: {
            prompt: "Which mode adds text to an existing file?",
            options: ["'r'", "'w'", "'a'"],
            answer: 2,
            explanation: "Append mode writes at the end.",
          },
          summary:
            "Use with for cleanup and a mode that matches what you want to do with existing data.",
        },
        {
          slug: "comprehensions",
          title: "Comprehensions, lambdas, and problem solving",
          minutes: 16,
          objectives: [
            "Filter and transform a list",
            "Sort records by a computed key",
          ],
          introduction:
            "A list comprehension describes how to create a list by selecting and transforming items. A lambda is a short function with one expression. When tackling a larger problem, choose a representation, split the work into steps, and test a small case first.",
          definition: [
            "Sort key",
            "The value a sort compares for each item, selected by a key function.",
          ],
          syntax:
            "Write [expression for item in items if condition] to filter and transform. Write lambda item: expression for a one-expression function.",
          application:
            "A budget tool can filter expenses by category and sort them by amount.",
          examples: [
            {
              title: "Filter and transform",
              code: "values = [1, 2, 3, 4]\nprint([n * 10 for n in values if n % 2 == 0])",
              output: "[20, 40]",
              explanation:
                "Start with the even values, then multiply each by ten.",
            },
            {
              title: "Sort by price",
              code: "rows = [('train', 18), ('bus', 8)]\nordered = sorted(rows, key=lambda row: row[1])\nprint(ordered[0][0])",
              output: "bus",
              explanation:
                "The key selects the price, so the smaller price comes first.",
            },
          ],
          mistake:
            "A dense comprehension is hard to debug. Use an ordinary loop when the steps need explanation.",
          exercise: {
            title: "Square the selected values",
            task: "Print the squares of the original values greater than 2.",
            starter: "values = [1, 2, 3, 4]\nresult = []\nprint(result)",
            expected: "[9, 16]",
            hint: "Filter on n > 2 before squaring.",
          },
          question: {
            prompt: "What does key=lambda row: row[1] select?",
            options: [
              "The second field",
              "The whole row",
              "The number of rows",
            ],
            answer: 0,
            explanation:
              "Python uses zero-based indexes, so position 1 is the second field.",
          },
          summary:
            "Use comprehensions for clear transformations and key functions to select comparison values.",
        },
      ],
      project: {
        title: "Basic expense tracker",
        task: "Total the food amounts and print the total. Try adding an expense in another category.",
        starter:
          "expenses = [('food', 12), ('bus', 5), ('food', 8)]\ntotal = 0\nprint(total)",
        expected: "20",
        hint: "Unpack category and amount, then sum the amounts with category == 'food'.",
      },
    },
  ],
} satisfies Course;
