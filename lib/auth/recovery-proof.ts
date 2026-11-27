import { createHmac, timingSafeEqual } from "node:crypto";

export const recoveryCookie = "dojo-recovery";
export const pendingCookie = "dojo-recovery-request";
export const recoveryAge = 15 * 60;
export const pendingAge = 60 * 60;

function secret() {
  const value =
    process.env.AUTH_RECOVERY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return value && Buffer.byteLength(value) >= 32 ? value : undefined;
}

export function recoveryConfigured() {
  return Boolean(secret());
}

function signature(
  key: string,
  purpose: string,
  value: string,
  expiry: number,
) {
  return createHmac("sha256", key)
    .update(JSON.stringify([purpose, value, expiry]))
    .digest("base64url");
}

export function sealRecovery(purpose: string, value: string, lifetime: number) {
  const key = secret();
  if (!key) return null;
  const expiry = Math.floor(Date.now() / 1000) + lifetime;
  return expiry + "." + signature(key, purpose, value, expiry);
}

export function checkRecovery(
  proof: string | undefined,
  purpose: string,
  value: string,
) {
  const key = secret();
  const match = /^(\d{10})\.([a-zA-Z0-9_-]{43})$/.exec(proof ?? "");
  if (!key || !match || Number(match[1]) <= Math.floor(Date.now() / 1000))
    return false;
  return timingSafeEqual(
    Buffer.from(match[2]),
    Buffer.from(signature(key, purpose, value, Number(match[1]))),
  );
}

export function recoverySessionKey(
  claims: { sub?: string; session_id?: unknown } | undefined,
) {
  return claims?.sub &&
    typeof claims.session_id === "string" &&
    claims.session_id
    ? claims.sub + ":" + claims.session_id
    : null;
}

export function recoveryOptions(secure: boolean, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge,
    path: "/",
  };
}

export function recoveryVerifier(
  url: string,
  cookies: { name: string; value: string }[],
  flowId: string | null,
) {
  if (flowId !== null && !/^[a-f0-9-]{1,64}$/i.test(flowId)) return null;
  const name =
    authCookieName(url) + (flowId ? "-flow-" + flowId : "") + "-code-verifier";
  const value = cookies.find((item) => item.name === name)?.value;
  return value ?? null;
}

export function authCookieName(url: string) {
  return "sb-" + new URL(url).hostname.split(".")[0] + "-auth-token";
}

export function hasLegacyRecoveryMarker(verifier: string | null) {
  if (!verifier) return false;
  try {
    const json = verifier.startsWith("base64-")
      ? Buffer.from(verifier.slice(7), "base64url").toString("utf8")
      : verifier;
    const value = JSON.parse(json);
    return typeof value === "string" && value.endsWith("/recovery");
  } catch {
    return false;
  }
}
