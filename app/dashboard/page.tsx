import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../auth-actions";
import { account } from "../../lib/supabase/server";
import { accountHelp, accountIssue } from "../../lib/supabase/diagnostics";
import { bankCapacity } from "../../lib/output/config";
import { difficulties, languages } from "../../lib/output/types";
import { practiceLevel } from "../../lib/sensei/types";

export const metadata = { title: "Your progress" };

type LearningDashboard = {
  totals: {
    attempts: number;
    correct: number;
    assisted: number;
    unclassified: number;
  };
  xp: number;
  completion: { language: string; difficulty: string; completed: number }[];
  seconds: number;
  sessions: {
    session_id: string;
    language: string;
    difficulty: string;
    created_at: string;
    correct: number;
    assisted: number;
    elapsed_seconds: number;
  }[];
  week: { day: string; total: number }[];
  streak: number;
  best_streak: number;
};

const date = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const time = (seconds: number) =>
  Math.floor(seconds / 60) + " min " + (seconds % 60) + " sec";
const percentage = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 100) : 0;

export default async function Dashboard() {
  const session = await account();
  if (!session) redirect("/login");
  const [profile, progress] = await Promise.all([
    session.client
      .from("profiles")
      .select("username, goal")
      .eq("id", session.user.id)
      .maybeSingle(),
    session.client.rpc("learning_dashboard"),
  ]);
  if (!profile.data && !profile.error) redirect("/onboarding");
  const data = progress.error
    ? null
    : (progress.data as LearningDashboard | null);
  const username = profile.data?.username;
  const rank = (level: number) =>
    level >= 10
      ? "Dojo Master"
      : level >= 5
        ? "Code Practitioner"
        : "Apprentice";
  const completion =
    data?.completion.reduce((sum, row) => sum + row.completed, 0) ?? 0;
  const bestDay = Math.max(1, ...(data?.week.map((day) => day.total) ?? []));
  const achievements = data
    ? [
        {
          title: "First Trace",
          earned: completion >= 1,
          description: "Solve one unique challenge",
        },
        {
          title: "Pattern Finder",
          earned: completion >= 25,
          description: "Solve 25 unique challenges",
        },
        {
          title: "Three-Day Streak",
          earned: data.best_streak >= 3,
          description: "Practice on three consecutive UTC days",
        },
        {
          title: "Level Up",
          earned: data.xp >= 100,
          description: "Earn 100 practice XP",
        },
      ]
    : [];
  return (
    <section className="wrap section account-dashboard">
      <header className="dashboard-identity">
        {username && (
          <span className="dashboard-avatar" aria-hidden="true">
            {username.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div>
          <h1>{username ? "Welcome, " + username : "Your progress"}</h1>
          {profile.data?.goal && <p className="muted">{profile.data.goal}</p>}
        </div>
      </header>
      {profile.error && (
        <p role="alert" className="card">
          Profile unavailable. {accountHelp[accountIssue(profile.error)]}
        </p>
      )}
      {progress.error && (
        <p role="alert" className="card">
          Learning progress unavailable.{" "}
          {accountHelp[accountIssue(progress.error)]}
        </p>
      )}
      {data && (
        <>
          <div className="card dashboard-hero">
            <div>
              <h2>
                Level {practiceLevel(data.xp)} · {rank(practiceLevel(data.xp))}
              </h2>
              <p>{data.xp.toLocaleString()} XP earned</p>
            </div>
            <label className="dojo-progress">
              {data.xp % 100}% toward the next level{" "}
              <progress max={100} value={data.xp % 100} />
            </label>
          </div>
          <dl className="dashboard-stats">
            {[
              ["Answers", data.totals.attempts],
              ["Correct", data.totals.correct],
              ["Incorrect", data.totals.attempts - data.totals.correct],
              [
                "Accuracy",
                data.totals.attempts
                  ? percentage(data.totals.correct, data.totals.attempts) + "%"
                  : "—",
              ],
              ["Streak", data.streak + (data.streak === 1 ? " day" : " days")],
              ["Unique challenges", completion],
              ["Practice time", time(data.seconds)],
              ["Assisted answers", data.totals.assisted],
            ].map(([label, value]) => (
              <div className="card" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {data.totals.unclassified > 0 && (
            <p className="muted">
              {data.totals.unclassified} earlier answers predate per-answer
              assistance tracking.
            </p>
          )}
          <div className="dashboard-columns">
            <section className="card dojo-panel">
              <h2>Language progress</h2>
              {languages.map((language) => {
                const rows = data.completion.filter(
                  (row) => row.language === language,
                );
                const count = rows.reduce((sum, row) => sum + row.completed, 0);
                const eligible = bankCapacity * difficulties.length;
                return (
                  <div key={language} className="dashboard-language">
                    <label className="dojo-progress">
                      <strong>
                        {language} · {percentage(count, eligible)}%
                      </strong>
                      <progress max={eligible} value={count} />
                    </label>
                    <dl>
                      {difficulties.map((difficulty) => {
                        const solved =
                          rows.find((row) => row.difficulty === difficulty)
                            ?.completed ?? 0;
                        return (
                          <div key={difficulty}>
                            <dt>{difficulty}</dt>
                            <dd>
                              {solved}/{bankCapacity} ·{" "}
                              {percentage(solved, bankCapacity)}%
                              <progress
                                aria-label={
                                  language + " " + difficulty + " completion"
                                }
                                value={solved}
                                max={bankCapacity}
                              />
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                );
              })}
              <p className="muted">
                C, C++, Java, HTML, CSS, PHP, and SQL are awaiting challenge
                banks.
              </p>
            </section>
            <section className="card dojo-panel">
              <h2>Weekly activity</h2>
              <ol
                className="dashboard-chart"
                aria-label="Answers per day in UTC"
              >
                {data.week.map((day) => (
                  <li key={day.day}>
                    <span>{day.total}</span>
                    <meter
                      aria-label={day.day}
                      min={0}
                      max={bestDay}
                      value={day.total}
                    >
                      {day.total}
                    </meter>
                    <small>
                      {date.format(new Date(day.day + "T00:00:00Z"))}
                    </small>
                  </li>
                ))}
              </ol>
              <h3>Achievements</h3>
              <ul className="dashboard-achievements">
                {achievements.map((badge) => (
                  <li key={badge.title}>
                    <strong>{badge.title}</strong>
                    <span>{badge.earned ? "Unlocked" : badge.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section className="card dojo-panel">
            <h2>Recent practice sessions</h2>
            {!data.sessions.length ? (
              <p className="muted">Finish a practice session to see it here.</p>
            ) : (
              <ul className="dashboard-sessions">
                {data.sessions.map((item) => (
                  <li key={item.session_id}>
                    <strong>
                      {item.language} · {item.difficulty}
                    </strong>
                    <span>
                      {item.correct} correct · {item.assisted} assisted ·{" "}
                      {time(item.elapsed_seconds)} ·{" "}
                      {date.format(new Date(item.created_at))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <div className="actions dojo-session-controls">
        <Link className="button" href="/practice/setup">
          Start practice
        </Link>
        <Link
          className="button outline"
          href="/learn/continue"
          prefetch={false}
        >
          Continue Learning
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
    </section>
  );
}
