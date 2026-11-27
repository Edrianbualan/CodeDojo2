export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <article className="wrap section prose">
      <h1>Privacy</h1>
      <p>
        The public demo and no-account practice keep your current session in
        browser memory. Reloading clears the local session.
      </p>
      <p>
        When a development Supabase project is configured, Supabase Auth handles
        account emails and password credentials. CodeDojo uses session cookies
        and stores your username, learning preferences, submitted practice
        choices, results, and XP in that project. The dashboard shows your own
        progress.
      </p>
      <p>
        A public release will need privacy information specific to the hosting
        environment and account support process.
      </p>
    </article>
  );
}
