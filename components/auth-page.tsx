import Link from "next/link";

import {
  forgotPassword,
  googleLogin,
  login,
  register,
} from "../app/auth-actions";
import { authConfig } from "../lib/supabase/config";
import { AccountForm } from "./account-form";
import { trainingReturn } from "../lib/auth/training-return";

const actions = { login, register, forgotPassword };
const titles = {
  login: "Sign in",
  register: "Create an account",
  forgotPassword: "Reset your password",
};

export async function AuthPage({
  mode,
  expired,
  next,
  passwordUpdated,
}: {
  mode: keyof typeof actions;
  expired?: boolean;
  next?: string;
  passwordUpdated?: boolean;
}) {
  const title = titles[mode];
  const destination = trainingReturn(next);
  const query = destination ? "?next=" + encodeURIComponent(destination) : "";
  const configured = authConfig();
  return (
    <section className="wrap section dojo-narrow">
      <h1>{title}</h1>
      <div className="card dojo-panel">
        {configured ? (
          <>
            {expired && (
              <p role="status">
                That link is invalid or expired. Request a new link or sign in.
              </p>
            )}
            {passwordUpdated && (
              <p role="status" className="dojo-correct">
                Password updated. Sign in with your new password.
              </p>
            )}
            <AccountForm
              action={actions[mode]}
              label={mode === "forgotPassword" ? "Send reset link" : title}
            >
              {destination && (
                <input type="hidden" name="next" value={destination} />
              )}
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
              {mode !== "forgotPassword" && (
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
              )}
            </AccountForm>
            {mode === "login" && process.env.ENABLE_GOOGLE_AUTH === "true" && (
              <AccountForm action={googleLogin} label="Continue with Google">
                <input type="hidden" name="next" value={destination ?? ""} />
              </AccountForm>
            )}
          </>
        ) : (
          <p>
            Account services require a configured Supabase project. You can use
            local practice now.
          </p>
        )}
        <div className="dojo-links">
          {mode !== "login" && <Link href={"/login" + query}>Sign in</Link>}
          {mode === "login" && (
            <>
              <Link href={"/register" + query}>Create an account</Link>
              <Link href="/forgot-password">Forgot password?</Link>
            </>
          )}
          <Link href="/practice/output">Predict the Output</Link>
        </div>
      </div>
    </section>
  );
}
