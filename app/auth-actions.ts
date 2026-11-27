"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { trainingReturn } from "../lib/auth/training-return";
import { z } from "zod";
import { account, serviceClient, supabase } from "../lib/supabase/server";
import { experiences, profileLanguages, goals } from "../lib/auth/preferences";
import { authOrigin } from "../lib/auth/origin";
import { authConfig } from "../lib/supabase/config";
import { recoverySession } from "../lib/auth/recovery-session";
import {
  authCookieName,
  pendingAge,
  pendingCookie,
  recoveryConfigured,
  recoveryCookie,
  recoveryOptions,
  recoveryVerifier,
  sealRecovery,
} from "../lib/auth/recovery-proof";

const email = z.email().max(254);
const password = z
  .string()
  .min(8)
  .max(72)
  .refine((value) => new TextEncoder().encode(value).length <= 72);
const credentials = z.object({ email, password });

export async function login(_: string, form: FormData) {
  const fields = credentials.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!fields.success) return "Enter a valid email and password.";
  const client = await supabase();
  if (!client) return "Account services are unavailable.";
  const { error } = await client.auth.signInWithPassword(fields.data);
  if (error)
    return "Sign-in failed. Check your credentials and email confirmation.";
  redirect(trainingReturn(form.get("next")) ?? "/dashboard");
}

export async function register(_: string, form: FormData) {
  const fields = credentials.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!fields.success)
    return "Enter a valid email and a password between 8 and 72 bytes.";
  const client = await supabase();
  const origin = authOrigin();
  if (!client || !origin) return "Account services are unavailable.";
  const { data, error } = await client.auth.signUp({
    ...fields.data,
    options: { emailRedirectTo: new URL("/auth/confirm", origin).href },
  });
  if (error)
    return "Registration could not be completed. Check your email or try again later.";
  const destination = trainingReturn(form.get("next"));
  if (data.session) redirect(destination ?? "/onboarding");
  if (destination)
    (await cookies()).set("training-return", destination, {
      httpOnly: true,
      sameSite: "lax",
      path: "/auth/confirm",
      maxAge: 3600,
    });
  return "If this email can be registered, you’ll receive a confirmation link.";
}

export async function forgotPassword(_: string, form: FormData) {
  const address = email.safeParse(form.get("email"));
  const client = await supabase();
  if (!address.success) return "Enter a valid email address.";
  const config = authConfig();
  const origin = authOrigin();
  if (!client || !config || !origin || !recoveryConfigured())
    return "Password recovery is unavailable. Try again later.";
  const { error } = await client.auth.resetPasswordForEmail(address.data, {
    redirectTo: new URL("/auth/confirm?flow=recovery", origin).href,
  });
  if (!error) {
    const jar = await cookies();
    const verifier = recoveryVerifier(config.url, jar.getAll(), null);
    const proof = verifier && sealRecovery("verifier", verifier, pendingAge);
    if (proof)
      jar.set(
        pendingCookie,
        proof,
        recoveryOptions(origin.startsWith("https:"), pendingAge),
      );
  }
  return "If that email belongs to an account, a reset link will be sent.";
}

export async function resetPassword(_: string, form: FormData) {
  const client = await recoverySession();
  if (!client) redirect("/forgot-password?link=expired");
  const value = password.safeParse(form.get("password"));
  if (!value.success) return "Choose a password between 8 and 72 bytes.";
  if (value.data !== form.get("confirmPassword"))
    return "The passwords do not match.";
  const { error } = await client.auth.updateUser({
    password: value.data,
  });
  if (error)
    return "Unable to update the password. Try a different password or request a new link.";
  const signOut = await client.auth
    .signOut({ scope: "local" })
    .catch(() => null);
  const jar = await cookies();
  const expired = recoveryOptions(
    Boolean(authOrigin()?.startsWith("https:")),
    0,
  );
  jar.set(recoveryCookie, "", expired);
  const config = authConfig();
  if (config && (!signOut || signOut.error)) {
    const name = authCookieName(config.url);
    for (const cookie of jar.getAll()) {
      if (cookie.name === name || cookie.name.startsWith(name + "."))
        jar.set(cookie.name, "", expired);
    }
  }
  redirect("/login?password=updated");
}

export async function logout() {
  const client = await supabase();
  await client?.auth.signOut({ scope: "local" });
  redirect("/login");
}

const profile = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/),
  experience: z.enum(experiences),
  preferences: z
    .array(z.enum(profileLanguages))
    .min(1)
    .max(profileLanguages.length),
  goal: z.enum(goals),
});

export async function saveProfile(_: string, form: FormData) {
  const session = await account();
  if (!session) redirect("/login");
  const fields = profile.safeParse({
    username: form.get("username"),
    experience: form.get("experience"),
    preferences: [...new Set(form.getAll("preferences"))],
    goal: form.get("goal"),
  });
  if (!fields.success)
    return "Choose a language, experience and goal. Use 3–24 letters, numbers or underscores for your username.";
  const { error } = await session.client
    .from("profiles")
    .upsert({ id: session.user.id, ...fields.data });
  if (error?.code === "23505") return "That username is taken.";
  if (error) return "Your profile couldn’t be saved. Try again later.";
  redirect("/dashboard");
}

export async function googleLogin(_: string, form: FormData) {
  if (process.env.ENABLE_GOOGLE_AUTH !== "true")
    return "Google sign-in is unavailable.";
  const client = await supabase();
  const origin = authOrigin();
  if (!client || !origin) return "Account services are unavailable.";
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL("/auth/confirm", origin).href },
  });
  if (error || !data.url) return "Google sign-in could not be started.";
  const destination = trainingReturn(form.get("next"));
  if (destination)
    (await cookies()).set("training-return", destination, {
      httpOnly: true,
      sameSite: "lax",
      path: "/auth/confirm",
      maxAge: 3600,
    });
  redirect(data.url);
}

export async function deleteAccount(_: string, form: FormData) {
  const session = await account();
  if (!session) redirect("/login");
  const confirmation = form.get("confirm");
  const value = password.safeParse(form.get("password"));
  if (confirmation !== "DELETE" || !value.success || !session.user.email) {
    return "Enter your current password and type DELETE to confirm.";
  }
  const writer = serviceClient();
  if (!writer)
    return "Account deletion requires the project’s server-only Supabase key.";
  const { data, error: verifyError } =
    await session.client.auth.signInWithPassword({
      email: session.user.email,
      password: value.data,
    });
  if (verifyError || data.user?.id !== session.user.id)
    return "Password confirmation failed.";
  const { error } = await writer.auth.admin.deleteUser(session.user.id);
  if (error) return "The account could not be deleted. Try again later.";
  await session.client.auth.signOut({ scope: "local" });
  redirect("/");
}
