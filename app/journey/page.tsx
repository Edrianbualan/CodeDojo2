import Link from "next/link";
export const metadata = { title: "Start Your Journey" };

export default function Journey() {
  return (
    <section className="wrap section academy">
      <h1>Start Your Journey</h1>
      <div className="academy-courses">
        <Link className="card academy-card" href="/learn">
          <h2>Learn Programming</h2>
          <p>Follow a course, run examples, and check what you’ve learned.</p>
        </Link>
        <Link className="card academy-card" href="/practice/setup">
          <h2>Practice Challenges</h2>
          <p>Choose a language, difficulty, and session length.</p>
        </Link>
        <Link
          className="card academy-card"
          href="/learn/continue"
          prefetch={false}
        >
          <h2>Continue Learning</h2>
          <p>Return to the last lesson saved to your account.</p>
        </Link>
      </div>
    </section>
  );
}
