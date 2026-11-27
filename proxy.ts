import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "./lib/supabase/config";
import { authOrigin } from "./lib/auth/origin";
import {
  checkRecovery,
  recoveryCookie,
  recoverySessionKey,
} from "./lib/auth/recovery-proof";

const authenticationPages = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/profile",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const config = authConfig();
  let response = NextResponse.next({ request });
  if (!config) return response;
  const origin = authOrigin(request.nextUrl.origin);
  if (
    origin &&
    origin.startsWith("https:") &&
    request.headers.get("host") !== new URL(origin).host &&
    authenticationPages.includes(request.nextUrl.pathname)
  ) {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, origin),
      {
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      },
    );
  }
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        for (const [name, value] of Object.entries(headers))
          response.headers.set(name, value);
      },
    },
  });
  const { data, error } = await client.auth.getClaims();
  const key = recoverySessionKey(data?.claims);
  if (
    !error &&
    key &&
    ["/dashboard", "/onboarding"].includes(request.nextUrl.pathname) &&
    checkRecovery(request.cookies.get(recoveryCookie)?.value, "session", key)
  ) {
    const reset = NextResponse.redirect(
      new URL("/reset-password", origin ?? request.nextUrl.origin),
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.getAll().forEach((cookie) => reset.cookies.set(cookie));
    return reset;
  }
  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/onboarding",
    "/profile",
    "/settings",
    "/practice/output",
  ],
};
