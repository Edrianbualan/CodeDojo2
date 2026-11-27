import Link from "next/link";
import { CodePreview } from "../components/code-preview";

const features = [
  {
    symbol: "⌨",
    title: "Type real code",
    detail:
      "Practice indentation, punctuation, and the symbols you use when programming.",
  },
  {
    symbol: "{}",
    title: "Debug and predict",
    detail:
      "Trace a program line by line, spot mistakes, and check what you expected it to print.",
  },
  {
    symbol: "▥",
    title: "Follow a learning path",
    detail:
      "Start with fundamentals and work toward algorithms, data structures, and interviews.",
  },
];

const languages = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "HTML",
  "CSS",
  "PHP",
  "SQL",
];
const levels = [
  ["Beginner", "Variables, loops, and functions"],
  ["Intermediate", "Objects, recursion, and databases"],
  ["Advanced", "Algorithms, testing, and architecture"],
  ["Professional", "Interviews, refactoring, and system design"],
];

export default function Home() {
  return (
    <>
      <section className="wrap hero" aria-labelledby="headline">
        <div>
          <p className="tagline">Learn. Practice. Compete. Master.</p>
          <h1 id="headline">
            Master the Art <em>of Code.</em>
          </h1>
          <p className="intro">
            Learn programming, sharpen your coding skills, solve real
            challenges, and compete with developers around the world.
          </p>
          <div className="actions">
            <Link className="button" href="/practice/setup">
              Start Your Journey
            </Link>
            <a className="button outline" href="#features">
              Explore Features
            </a>
          </div>
        </div>
        <CodePreview />
      </section>
      <section className="band" id="features">
        <div className="wrap section">
          <h2>Practice with purpose</h2>
          <p className="muted">
            Try a full{" "}
            <Link href="/practice/output" className="dojo-text-link">
              Predict the Output
            </Link>{" "}
            session, or use the quick demo above.
          </p>
          <div className="card-grid">
            {features.map((feature) => (
              <article className="card" key={feature.title}>
                <span className="feature-icon" aria-hidden="true">
                  {feature.symbol}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap section" id="languages">
        <h2>Languages on the roadmap</h2>
        <ul className="language-list">
          {languages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
        <h3 className="level-heading">Choose your starting point</h3>
        <ul className="levels">
          {levels.map(([level, description]) => (
            <li key={level}>
              <strong>{level}</strong>
              <span>{description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="band" id="faq">
        <div className="wrap section faq">
          <h2>Frequently asked questions</h2>
          <details>
            <summary>Can I start with no coding experience?</summary>
            <p>
              Yes. The sample explains the answer after you submit. The beginner
              learning path will start with variables, expressions, and control
              flow.
            </p>
          </details>
          <details>
            <summary>Do I need an account to try the demo?</summary>
            <p>
              The demo is public and your answers stay in the current page. Full
              sessions save progress when CodeDojo is connected to Supabase and
              you’re signed in.
            </p>
          </details>
          <details>
            <summary>Does the demo run the code?</summary>
            <p>
              It checks your selection against an original, prewritten example
              and explains the result.
            </p>
          </details>
        </div>
      </section>
      <section className="wrap section closing">
        <h2>Try your first CodeDojo exercise</h2>
        <Link className="button" href="/practice/setup">
          Start Your Journey
        </Link>
      </section>
    </>
  );
}
