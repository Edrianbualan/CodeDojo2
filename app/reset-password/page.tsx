import Link from "next/link";
import { redirect } from "next/navigation";
import { resetPassword } from "../auth-actions";
import { AccountForm } from "../../components/account-form";
import { NewPasswordFields } from "../../components/new-password-fields";
import { recoverySession } from "../../lib/auth/recovery-session";

export const metadata = { title: "Reset password" };

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.token_hash || params.code || params.error || params.error_code) {
    const callback = new URLSearchParams({ flow: "recovery" });
    for (const name of [
      "token_hash",
      "code",
      "type",
      "sb_flow_id",
      "error",
      "error_code",
    ]) {
      if (typeof params[name] === "string") callback.set(name, params[name]);
    }
    if (callback.has("token_hash") && !callback.has("type"))
      callback.set("type", "recovery");
    redirect("/auth/confirm?" + callback);
  }
  if (!(await recoverySession())) redirect("/forgot-password?link=expired");
  return (
    <section className="wrap section dojo-narrow">
      <h1>Choose a new password</h1>
      <div className="card dojo-panel">
        <AccountForm action={resetPassword} label="Update password">
          <NewPasswordFields />
        </AccountForm>
        <Link href="/forgot-password">Request a new reset link</Link>
      </div>
    </section>
  );
}
