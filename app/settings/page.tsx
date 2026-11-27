import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteAccount } from "../auth-actions";
import { AccountForm } from "../../components/account-form";
import { account } from "../../lib/supabase/server";

export const metadata = { title: "Account settings" };

export default async function Settings() {
  if (!(await account())) redirect("/login");
  return (
    <section className="wrap section dojo-narrow">
      <h1>Account settings</h1>
      <div className="card dojo-panel">
        <div className="dojo-links">
          <Link href="/profile">Edit profile</Link>
          <Link href="/forgot-password">Request a password reset</Link>
          <Link href="/dashboard">Your progress</Link>
        </div>
        <h2 className="dojo-heading">Delete account</h2>
        <p>
          This permanently removes your account, profile, and saved practice
          results. If you signed in with Google, use password recovery to set a
          password first.
        </p>
        {process.env.SUPABASE_SERVICE_ROLE_KEY ? (
          <AccountForm
            action={deleteAccount}
            label="Permanently delete account"
          >
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                name="password"
                minLength={8}
                maxLength={72}
                required
              />
            </label>
            <label>
              Type DELETE to confirm
              <input
                name="confirm"
                pattern="DELETE"
                autoComplete="off"
                required
              />
            </label>
          </AccountForm>
        ) : (
          <p>
            Account deletion requires the development project’s server-only
            Supabase key.
          </p>
        )}
      </div>
    </section>
  );
}
