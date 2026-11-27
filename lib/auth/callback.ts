export function callbackIntent(params: URLSearchParams) {
  if (
    params.has("error") ||
    params.has("error_code") ||
    params.has("error_description")
  )
    return null;
  const token = params.get("token_hash");
  const code = params.get("code");
  const type = params.get("type");
  const expectsRecovery =
    type === "recovery" || params.get("flow") === "recovery";
  if (token && code) return null;
  if (token) {
    if (type === "recovery")
      return { kind: "otp" as const, token, type, expectsRecovery: true };
    if (expectsRecovery || (type !== "email" && type !== "signup")) return null;
    return { kind: "otp" as const, token, type, expectsRecovery: false };
  }
  if (code)
    return {
      kind: "pkce" as const,
      code,
      flowId: params.get("sb_flow_id"),
      expectsRecovery,
    };
  return null;
}
