import { redirect } from "next/navigation";
import { saveProfile } from "../app/auth-actions";
import { experiences, goals, profileLanguages } from "../lib/auth/preferences";
import { account } from "../lib/supabase/server";
import { AccountForm } from "./account-form";

export async function ProfileForm({ editing = false }: { editing?: boolean }) {
  const session = await account();
  if (!session) redirect("/login");
  const { data, error } = await session.client
    .from("profiles")
    .select("username, experience, preferences, goal")
    .eq("id", session.user.id)
    .maybeSingle();
  return (
    <section className="wrap section dojo-narrow">
      <h1>{editing ? "Your profile" : "Set up your profile"}</h1>
      <div className="card dojo-panel">
        {error ? (
          <p role="alert">
            Your profile couldn’t be loaded. Check the database connection and
            try again.
          </p>
        ) : (
          <AccountForm action={saveProfile} label="Save profile">
            <label>
              Username
              <input
                name="username"
                autoComplete="username"
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_]{3,24}"
                required
                defaultValue={data?.username}
              />
            </label>
            <label>
              Experience
              <select
                name="experience"
                defaultValue={data?.experience ?? experiences[0]}
              >
                {experiences.map((experience) => (
                  <option key={experience}>{experience}</option>
                ))}
              </select>
            </label>
            <div>
              <p id="profile-languages">Preferred languages</p>
              <div
                className="options"
                role="group"
                aria-labelledby="profile-languages"
              >
                {profileLanguages.map((language) => (
                  <label key={language}>
                    <input
                      type="checkbox"
                      name="preferences"
                      value={language}
                      defaultChecked={
                        data?.preferences.includes(language) ??
                        language === "Python"
                      }
                    />
                    {language}
                  </label>
                ))}
              </div>
            </div>
            <label>
              Learning goal
              <select name="goal" defaultValue={data?.goal ?? goals[0]}>
                {goals.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </select>
            </label>
          </AccountForm>
        )}
      </div>
    </section>
  );
}
