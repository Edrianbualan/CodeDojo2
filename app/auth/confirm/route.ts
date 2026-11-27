import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase/server";
import { authConfig } from "../../../lib/supabase/config";
import { trainingReturn } from "../../../lib/auth/training-return";
import { authOrigin } from "../../../lib/auth/origin";
import { callbackIntent } from "../../../lib/auth/callback";
import {
  checkRecovery,
  hasLegacyRecoveryMarker,
  pendingCookie,
  recoveryAge,
  recoveryCookie,
  recoveryOptions,
  recoverySessionKey,
  recoveryVerifier,
  sealRecovery,
} from "../../../lib/auth/recovery-proof";

export async function GET(request: NextRequest) {
  const origin = authOrigin(request.nextUrl.origin);
  if (!origin)
    return new NextResponse(
      "Set the production app URL before using authentication.",
      { status: 503 },
    );
  const secure = origin.startsWith("https:");
  const go = (path: string) =>
    NextResponse.redirect(new URL(path, origin), {
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  if (secure && request.headers.get("host") !== new URL(origin).host)
    return go("/auth/confirm" + request.nextUrl.search);
  const params = request.nextUrl.searchParams;
  const intent = callbackIntent(params);
  const failed = (recovery: boolean) =>
    go(recovery ? "/forgot-password?link=expired" : "/login?link=expired");
  if (!intent) {
    const recovery =
      params.get("flow") === "recovery" ||
      params.get("type") === "recovery" ||
      Boolean(request.cookies.get(pendingCookie));
    return failed(recovery);
  }

  const client = await supabase();
  const config = authConfig();
  if (!client || !config) return failed(intent.expectsRecovery);
  let recovery = intent.expectsRecovery;
  let accessToken: string | undefined;
  if (intent.kind === "otp") {
    const result = await client.auth.verifyOtp({
      token_hash: intent.token,
      type: intent.type,
    });
    if (result.error) return failed(recovery);
    accessToken = result.data.session?.access_token;
  } else {
    const verifier = recoveryVerifier(
      config.url,
      request.cookies.getAll(),
      intent.flowId,
    );
    const serverStartedRecovery = Boolean(
      verifier &&
      checkRecovery(
        request.cookies.get(pendingCookie)?.value,
        "verifier",
        verifier,
      ),
    );
    if (
      (recovery || hasLegacyRecoveryMarker(verifier)) &&
      !serverStartedRecovery
    )
      return failed(true);
    const result = await client.auth.exchangeCodeForSession(
      intent.code,
      intent.flowId ? { flowId: intent.flowId } : undefined,
    );
    if (result.error) return failed(recovery || serverStartedRecovery);
    recovery = serverStartedRecovery;
    accessToken = result.data.session.access_token;
  }

  if (!accessToken) return failed(recovery);
  if (recovery) {
    const { data, error } = await client.auth.getClaims(accessToken);
    const key = recoverySessionKey(data?.claims);
    const proof = !error && key && sealRecovery("session", key, recoveryAge);
    if (!proof) {
      await client.auth.signOut({ scope: "local" });
      return failed(true);
    }
    const response = go("/reset-password");
    response.cookies.set(
      recoveryCookie,
      proof,
      recoveryOptions(secure, recoveryAge),
    );
    response.cookies.set(pendingCookie, "", recoveryOptions(secure, 0));
    return response;
  }

  const destination = trainingReturn(
    request.cookies.get("training-return")?.value,
  );
  const response = go(destination ?? "/dashboard");
  response.cookies.set("training-return", "", {
    path: "/auth/confirm",
    maxAge: 0,
  });
  response.cookies.set(recoveryCookie, "", recoveryOptions(secure, 0));
  return response;
}
