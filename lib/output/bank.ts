import {
  difficulties,
  type Difficulty,
  type Language,
  type Prompt,
} from "./types.ts";

type Family = {
  topic: string;
  code: string;
  solve: (n: number) => number;
  explanation: string;
};
type Question = Omit<Prompt, "options"> & {
  answer: string;
  explanation: string;
  options: string[];
  language: Language;
  difficulty: Difficulty;
};

const python = [
  [
    {
      topic: "Precedence",
      code: "x = {n}\nprint(x + 2 * 3)",
      solve: (n: number) => n + 6,
      explanation:
        "Multiplication comes first. The product 2 × 3 is 6, so Python adds 6 to {n}.",
    },
    {
      topic: "Indexing",
      code: "values = [{n}, {n} + 3, {n} + 5]\nprint(values[1])",
      solve: (n: number) => n + 3,
      explanation:
        "Index 0 selects the first element. Index 1 selects the second element, {n} + 3.",
    },
    {
      topic: "Branching",
      code: "count = {n}\nif count % 2 == 0:\n    count += 2\nelse:\n    count += 5\nprint(count)",
      solve: (n: number) => n + (n % 2 === 0 ? 2 : 5),
      explanation:
        "The remainder of {n} divided by 2 is {parity}. The even branch adds 2 and the odd branch adds 5.",
    },
    {
      topic: "Floor division",
      code: "print(({n} * 3 + 1) // 3)",
      solve: (n: number) => n,
      explanation:
        "Python’s // takes the floor of the quotient. The numerator is three times {n} plus 1, so the extra third is discarded.",
    },
    {
      topic: "Functions",
      code: "def scale(value):\n    return value * 2\n\nprint(scale({n}) - 1)",
      solve: (n: number) => n * 2 - 1,
      explanation:
        "The function doubles {n}. The subtraction happens after scale returns, so the output is one less than twice {n}.",
    },
  ],
  [
    {
      topic: "Comprehensions",
      code: "values = [x * 2 for x in range({n}, {n} + 3)]\nprint(sum(values))",
      solve: (n: number) => 6 * n + 6,
      explanation:
        "The range contains {n} through {n}+2. The comprehension doubles each value before sum adds them.",
    },
    {
      topic: "Slicing",
      code: "values = list(range({n}, {n} + 7))\nprint(sum(values[1:6:2]))",
      solve: (n: number) => 3 * n + 9,
      explanation:
        "The slice selects positions 1, 3, and 5 because the stop index 6 is excluded. Add those three offsets to three copies of {n}.",
    },
    {
      topic: "Dictionary defaults",
      code: "counts = {'red': {n}}\nfor color in ['blue', 'red', 'blue']:\n    counts[color] = counts.get(color, 0) + 1\nprint(counts['red'] + counts['blue'])",
      solve: (n: number) => n + 3,
      explanation:
        "Blue starts at the default 0 and increases twice. Red starts at {n} and increases once.",
    },
    {
      topic: "Exceptions",
      code: "x = {n}\ntry:\n    x += int('oops')\nexcept ValueError:\n    x += 4\nfinally:\n    x *= 2\nprint(x)",
      solve: (n: number) => (n + 4) * 2,
      explanation:
        "The conversion raises ValueError before the first assignment. The except block adds 4 and finally doubles the new value.",
    },
    {
      topic: "Set intersection",
      code: "left = {{n}, {n} + 1, {n} + 4}\nright = {{n} + 1, {n} + 4, {n} + 5}\nprint(sum(left & right))",
      solve: (n: number) => 2 * n + 5,
      explanation:
        "Only the two shared values stay in the intersection. Their offsets from {n} are 1 and 4.",
    },
  ],
  [
    {
      topic: "Generators",
      code: "values = (x * 2 for x in range({n}, {n} + 4))\nfirst = next(values)\nnext(values)\nprint(first + sum(values))",
      solve: (n: number) => 6 * n + 10,
      explanation:
        "The first call consumes 2 × {n}. The second consumes and discards the next value. Sum sees only the last two doubled values.",
    },
    {
      topic: "Mutable defaults",
      code: "def stash(value, bag=[]):\n    bag.append(value)\n    return sum(bag)\n\nstash({n})\nprint(stash(3) + stash(2, []))",
      solve: (n: number) => n + 5,
      explanation:
        "The first two calls share the default list, which totals {n} + 3 on the second call. The explicit empty list totals 2.",
    },
    {
      topic: "Closure state",
      code: "def counter(value):\n    def advance(step):\n        nonlocal value\n        value += step\n        return value\n    return advance\n\nadvance = counter({n})\nprint(advance(2) + advance(4))",
      solve: (n: number) => 2 * n + 8,
      explanation:
        "Both calls mutate the same enclosed value. The first returns {n} + 2 and the second starts there and adds 4.",
    },
    {
      topic: "Recursive calls",
      code: "def total(x):\n    if x <= 1:\n        return x\n    return x + total(x - 2)\n\nprint(total({n}))",
      solve: (n: number) =>
        n % 2 === 0 ? (n / 2) * (n / 2 + 1) : ((n + 1) / 2) ** 2,
      explanation:
        "Each call adds its argument and passes an argument two smaller. The sum continues down to 0 for even inputs and 1 for odd inputs.",
    },
    {
      topic: "Shallow copies",
      code: "base = [[{n}], [2]]\ncopy = base[:]\ncopy[0].append(3)\ncopy[1] = [9]\nprint(sum(base[0]) + sum(base[1]))",
      solve: (n: number) => n + 5,
      explanation:
        "The outer lists differ, but they initially refer to the same nested lists. Appending affects the shared first list. Replacing a slot in copy leaves the second list in base intact.",
    },
  ],
  [
    {
      topic: "Descriptors",
      code: "class Scale:\n    def __get__(self, instance, owner):\n        return instance.value * 3\n    def __set__(self, instance, value):\n        instance.value = value - 1\n\nclass Counter:\n    size = Scale()\n\nc = Counter()\nc.size = {n}\nprint(c.size + c.value)",
      solve: (n: number) => 4 * (n - 1),
      explanation:
        "Assigning size calls the descriptor setter, which stores {n} − 1 in value. Reading size calls the getter, so the print adds three copies of value to one more copy.",
    },
    {
      topic: "Cooperative inheritance",
      code: "class Base:\n    def total(self): return {n}\nclass Left(Base):\n    def total(self): return super().total() * 2\nclass Right(Base):\n    def total(self): return super().total() + 3\nclass Both(Left, Right):\n    pass\n\nprint(Both().total())",
      solve: (n: number) => 2 * (n + 3),
      explanation:
        "Both resolves methods in the order Both, Left, Right, Base. Left’s super calls Right, which adds 3 to the base value before Left doubles it.",
    },
    {
      topic: "Generator delegation",
      code: "def inner():\n    yield {n}\n    return {n} + 2\n\ndef outer():\n    end = yield from inner()\n    yield end * 2\n\nprint(sum(outer()))",
      solve: (n: number) => 3 * n + 4,
      explanation:
        "Yield from forwards the first yielded value. The inner return becomes the value of the yield-from expression, so outer then yields twice {n} + 4.",
    },
    {
      topic: "Iterator aliasing",
      code: "source = iter(range({n}, {n} + 7))\npairs = zip(source, source)\nprint(sum(b - a + b for a, b in pairs))",
      solve: (n: number) => 3 * n + 12,
      explanation:
        "Both zip slots consume the same iterator. The second values are {n}+1, {n}+3, and {n}+5. Each b−a is 1 and the unmatched final item yields no pair.",
    },
    {
      topic: "Context manager suppression",
      code: "class Guard:\n    def __enter__(self): return {n}\n    def __exit__(self, kind, value, trace):\n        return kind is ValueError\n\nwith Guard() as value:\n    value *= 2\n    raise ValueError('stop')\n    value += 100\nprint(value + 1)",
      solve: (n: number) => 2 * n + 1,
      explanation:
        "The body doubles the entered value then raises. The true result from __exit__ suppresses the exception, but execution resumes after the with block. The +100 never runs.",
    },
  ],
] satisfies Family[][];

const javascript = [
  [
    {
      topic: "Precedence",
      code: "const x = {n};\nconsole.log(x + 3 * 4);",
      solve: (n: number) => n + 12,
      explanation:
        "Multiplication runs first, producing 12. Addition then combines 12 with {n}.",
    },
    {
      topic: "Array indexing",
      code: "const values = [{n}, {n} + 2, {n} + 6];\nconsole.log(values[2]);",
      solve: (n: number) => n + 6,
      explanation:
        "Array indices start at zero. Position 2 contains the third value, which is {n} + 6.",
    },
    {
      topic: "Conditionals",
      code: "const count = {n};\nconst bonus = count % 2 === 0 ? 3 : 7;\nconsole.log(count + bonus);",
      solve: (n: number) => n + (n % 2 === 0 ? 3 : 7),
      explanation:
        "The remainder of {n} divided by 2 is {parity}. The conditional chooses 3 for an even number and 7 otherwise.",
    },
    {
      topic: "Loop accumulation",
      code: "let total = {n};\nfor (let i = 1; i <= 3; i++) total += i;\nconsole.log(total);",
      solve: (n: number) => n + 6,
      explanation:
        "The loop adds 1, then 2, then 3. The starting value is {n}, so the total grows by 6.",
    },
    {
      topic: "Function returns",
      code: "function scale(x) {\n  return x * 3;\n}\nconsole.log(scale({n}) + 2);",
      solve: (n: number) => 3 * n + 2,
      explanation:
        "The call returns three times {n}. The caller then adds 2 to that return value.",
    },
  ],
  [
    {
      topic: "Map and filter",
      code: "const values = [{n}, {n} + 1, {n} + 2];\nconst result = values.map(x => x - {n}).filter(x => x > 0);\nconsole.log(result.reduce((sum, x) => sum + x, {n}));",
      solve: (n: number) => n + 3,
      explanation:
        "Map creates [0, 1, 2] and filter drops 0. Reduce starts from {n} and adds 1 and 2.",
    },
    {
      topic: "Rest destructuring",
      code: "const [first, ...rest] = [{n}, {n} + 2, {n} + 4];\nconsole.log(rest[1] - first + rest[0]);",
      solve: (n: number) => n + 6,
      explanation:
        "First holds {n}. Rest is a two-item array whose second value is {n} + 4. The difference is 4, which is added to the first rest value.",
    },
    {
      topic: "Nullish coalescing",
      code: "const settings = { points: 0, bonus: null };\nconsole.log((settings.points ?? {n}) + (settings.bonus ?? {n} + 3));",
      solve: (n: number) => n + 3,
      explanation:
        "Zero is preserved by ??, while null uses the fallback. Only the bonus becomes {n} + 3.",
    },
    {
      topic: "Object spread",
      code: "const base = { a: {n}, b: 2 };\nconst copy = { ...base, a: base.a + 4 };\nconsole.log(base.a + copy.a + copy.b);",
      solve: (n: number) => 2 * n + 6,
      explanation:
        "The spread copies both properties. The following a entry overrides a in the copy only, and b stays 2.",
    },
    {
      topic: "Switch fallthrough",
      code: "let total = {n};\nswitch (total % 2) {\n  case 0: total += 4;\n  case 1: total += 3; break;\n}\nconsole.log(total);",
      solve: (n: number) => n + 3 + (n % 2 === 0 ? 4 : 0),
      explanation:
        "The remainder is {parity}. Case 0 runs both additions because there is no break after it. Case 1 runs only the +3.",
    },
  ],
  [
    {
      topic: "Closure state",
      code: "function counter(value) {\n  return (step) => (value += step);\n}\nconst next = counter({n});\nconsole.log(next(2) + next(5));",
      solve: (n: number) => 2 * n + 9,
      explanation:
        "Both calls close over the same value. The first returns {n} + 2 and the second returns {n} + 7.",
    },
    {
      topic: "Generator consumption",
      code: "function* sequence() {\n  yield {n};\n  yield {n} + 2;\n  yield {n} + 4;\n}\nconst iter = sequence();\nconst first = iter.next().value;\niter.next();\nconsole.log(first + [...iter][0]);",
      solve: (n: number) => 2 * n + 4,
      explanation:
        "The second next call discards the middle value. Spreading the generator consumes only the remaining value, {n} + 4.",
    },
    {
      topic: "Shallow copies",
      code: "const original = { box: { value: {n} } };\nconst copy = { ...original };\ncopy.box.value += 2;\ncopy.box = { value: 7 };\nconsole.log(original.box.value + copy.box.value);",
      solve: (n: number) => n + 9,
      explanation:
        "The copied outer object shares the nested box at first. The increment changes the shared box, then assigning copy.box replaces only the copy’s reference.",
    },
    {
      topic: "Recursion",
      code: "function steps(value) {\n  if (value <= 0) return 0;\n  return 2 + steps(value - 3);\n}\nconsole.log(steps({n}));",
      solve: (n: number) => 2 * Math.ceil(n / 3),
      explanation:
        "Each positive argument contributes 2 before the argument drops by 3. There are ceil({n} ÷ 3) positive arguments.",
    },
    {
      topic: "Receiver binding",
      code: "const box = { value: {n}, add(n) { return this.value + n; } };\nconst add = box.add.bind({ value: 4 });\nconsole.log(box.add(3) + add(2));",
      solve: (n: number) => n + 9,
      explanation:
        "The method call uses box as its receiver and returns {n} + 3. The bound function always uses the object with value 4, so add(2) returns 6.",
    },
  ],
  [
    {
      topic: "Prototype accessors",
      code: "const base = { get total() { return this.value * 2; } };\nconst child = Object.create(base);\nchild.value = {n};\nconst grandchild = Object.create(child);\ngrandchild.value = {n} + 3;\nconsole.log(grandchild.total + child.total);",
      solve: (n: number) => 4 * n + 6,
      explanation:
        "The getter lives on base, but this is the original receiver. Grandchild doubles {n} + 3 and child doubles {n}.",
    },
    {
      topic: "Generator delegation",
      code: "function* inner() {\n  yield {n};\n  return {n} + 2;\n}\nfunction* outer() {\n  const value = yield* inner();\n  yield value * 3;\n}\nconsole.log([...outer()].reduce((a, b) => a + b, 0));",
      solve: (n: number) => 4 * n + 6,
      explanation:
        "Yield* forwards the yielded value. The inner return is captured by outer, which yields three times that return value.",
    },
    {
      topic: "Sparse arrays",
      code: "const values = [{n}, , {n} + 3];\nconst mapped = values.map(x => x * 2);\nconsole.log(Object.keys(mapped).length + mapped[2]);",
      solve: (n: number) => 2 * n + 8,
      explanation:
        "Map skips the hole at index 1 and preserves it. Object.keys counts only two assigned indices, and index 2 holds twice {n} + 6.",
    },
    {
      topic: "Promise ordering",
      code: "const values = [{n}];\nPromise.resolve().then(() => values.push(2));\nvalues.push(3);\nqueueMicrotask(() => console.log(values.reduce((a, b) => a * 10 + b)));",
      solve: (n: number) => 100 * n + 32,
      explanation:
        "The synchronous push adds 3 first. The promise reaction was queued before the final microtask, so it adds 2 before the reduction appends the two decimal digits.",
    },
    {
      topic: "Private fields and static methods",
      code: "class Counter {\n  #value;\n  constructor(value) { this.#value = value; }\n  static compare(a, b) { return a.#value * 2 + b.#value; }\n}\nconsole.log(Counter.compare(new Counter({n}), new Counter(3)));",
      solve: (n: number) => 2 * n + 3,
      explanation:
        "Code inside Counter can access its private field on any Counter instance. The static method doubles the first instance’s value and adds the second instance’s 3.",
    },
  ],
] satisfies Family[][];

const families = { Python: python, JavaScript: javascript };
export const xpValues = {
  Beginner: 5,
  Intermediate: 10,
  Advanced: 15,
  Expert: 20,
} as const;

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

const pools = new Map<string, Question[][]>();
const questions = new Map<string, Question>();
for (const [language, levels] of Object.entries(families) as [
  Language,
  Family[][],
][]) {
  levels.forEach((families, level) => {
    const difficulty = difficulties[level];
    const groups = families.map((family, index) =>
      Array.from({ length: 14 }, (_, offset) => {
        const n = offset + 2;
        const answer = family.solve(n);
        const question = {
          id: `${language}-${level}-${index}-${offset}`.toLowerCase(),
          language,
          difficulty,
          topic: family.topic,
          code: family.code.replaceAll("{n}", String(n)),
          answer: String(answer),
          options: [answer, answer + 1, answer - 2, answer + 3].map(String),
          explanation: family.explanation
            .replaceAll("{n}", String(n))
            .replaceAll("{parity}", String(n % 2)),
        };
        questions.set(question.id, question);
        return question;
      }),
    );
    pools.set(`${language}-${difficulty}`, groups);
  });
}

export function findQuestion(id: string) {
  return questions.get(id);
}

export function selectQuestions(
  language: Language,
  difficulty: Difficulty,
  length: number,
  recent: readonly string[] = [],
  random = true,
): Prompt[] {
  const groups = pools.get(`${language}-${difficulty}`) ?? [];
  const seen = new Set(recent);
  const fresh = groups.map((group) =>
    (random ? shuffle(group) : [...group].reverse()).filter(
      ({ id }) => !seen.has(id),
    ),
  );
  const previous = groups.map((group) =>
    (random ? shuffle(group) : [...group].reverse()).filter(({ id }) =>
      seen.has(id),
    ),
  );
  const result: Question[] = [];
  for (const buckets of [fresh, previous]) {
    while (result.length < length && buckets.some((bucket) => bucket.length)) {
      for (const bucket of random ? shuffle(buckets) : buckets) {
        const candidate = bucket.pop();
        if (candidate) result.push(candidate);
        if (result.length === length) break;
      }
    }
  }
  return result.map(({ id, topic, code, options }) => ({
    id,
    topic,
    code,
    options: random
      ? shuffle(options)
      : [...options].sort((left, right) => Number(left) - Number(right)),
  }));
}
