import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../auth-actions";
import { account } from "../../lib/supabase/server";

export const metadata = { title: "Your progress" };
type ProgressRow = {
  language: string;
  difficulty: string;
  attempts: number;
  correct: number;
  xp: number;
};
function accuracy(correct: number, total: number) {
  return total ? `${Math.round((correct / total) * 100)}%` : "—";
}

export default async function Dashboard() {
  const session = await account();
  if (!session) redirect("/login");
  const [profile, progress] = await Promise.all([
    session.client
      .from("profiles")
      .select("username, goal")
      .eq("id", session.user.id)
      .maybeSingle(),
    session.client.rpc("output_progress"),
  ]);
  if (!profile.data && !profile.error) redirect("/onboarding");
  const rows: ProgressRow[] = progress.data ?? [];
  const totals = rows.reduce(
    (sum, row) => ({
      attempts: sum.attempts + row.attempts,
      correct: sum.correct + row.correct,
      xp: sum.xp + row.xp,
    }),
    { attempts: 0, correct: 0, xp: 0 },
  );
  return (
    <section className="wrap section dojo-narrow">
      <h1>
        {profile.data ? `Welcome, ${profile.data.username}` : "Your progress"}
      </h1>
      {profile.data && <p className="intro">{profile.data.goal}</p>}
      {profile.error && <p role="alert">Your profile couldn’t be loaded.</p>}
      <div className="card dojo-panel">
        <h2>Predict the Output</h2>
        {progress.error ? (
          <p role="alert">
            Progress couldn’t be loaded. Check the database connection and try
            again.
          </p>
        ) : !rows.length ? (
          <p className="muted">
            Answer your first question to see your progress here.
          </p>
        ) : (
          <>
            <div className="dojo-score">
              <p>
                <strong>{totals.attempts}</strong> answers
              </p>
              <p>
                <strong>{accuracy(totals.correct, totals.attempts)}</strong>{" "}
                accuracy
              </p>
              <p>
                <strong>{totals.xp}</strong> XP
              </p>
            </div>
            <div
              className="dojo-table"
              tabIndex={0}
              role="region"
              aria-label="Progress by language and difficulty"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">Language</th>
                    <th scope="col">Difficulty</th>
                    <th scope="col">Correct</th>
                    <th scope="col">Accuracy</th>
                    <th scope="col">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.language + row.difficulty}>
                      <td>{row.language}</td>
                      <td>{row.difficulty}</td>
                      <td>
                        {row.correct}/{row.attempts}
                      </td>
                      <td>{accuracy(row.correct, row.attempts)}</td>
                      <td>{row.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="actions">
          <Link className="button" href="/practice/output">
            Start practice
          </Link>
          <Link className="button outline" href="/profile">
            Edit profile
          </Link>
          <Link className="button outline" href="/settings">
            Settings
          </Link>
          <form action={logout}>
            <button className="button outline">Sign out</button>
          </form>
        </div>
      </div>
    </section>
  );
}
