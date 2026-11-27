import assert from "node:assert/strict";
import { test } from "node:test";
import { callbackIntent } from "../lib/auth/callback.ts";
import { resolveAuthOrigin } from "../lib/auth/origin.ts";
import {
  checkRecovery,
  recoverySessionKey,
  sealRecovery,
} from "../lib/auth/recovery-proof.ts";

test("registration confirmation keeps its own callback intent", () => {
  for (const type of ["email", "signup"]) {
    assert.deepEqual(
      callbackIntent(new URLSearchParams({ token_hash: "confirmation", type })),
      {
        kind: "otp",
        token: "confirmation",
        type,
        expectsRecovery: false,
      },
    );
  }
  assert.equal(
    callbackIntent(
      new URLSearchParams({
        type: "email",
        token_hash: "confirmation",
        flow: "recovery",
      }),
    ),
    null,
  );
});

test("recovery token, PKCE intent and expired links are parsed independently", () => {
  assert.deepEqual(
    callbackIntent(
      new URLSearchParams({ token_hash: "recovery", type: "recovery" }),
    ),
    {
      kind: "otp",
      token: "recovery",
      type: "recovery",
      expectsRecovery: true,
    },
  );
  assert.deepEqual(
    callbackIntent(new URLSearchParams({ code: "code", sb_flow_id: "flow" })),
    {
      kind: "pkce",
      code: "code",
      flowId: "flow",
      expectsRecovery: false,
    },
  );
  assert.equal(
    callbackIntent(
      new URLSearchParams({ error_code: "otp_expired", type: "recovery" }),
    ),
    null,
  );
});

test("recovery proofs expire and are bound to purpose, user and Supabase session", (t) => {
  const old = process.env.AUTH_RECOVERY_SECRET;
  process.env.AUTH_RECOVERY_SECRET =
    "only-used-by-the-local-recovery-unit-test";
  t.after(() => {
    if (old === undefined) delete process.env.AUTH_RECOVERY_SECRET;
    else process.env.AUTH_RECOVERY_SECRET = old;
  });
  const key = recoverySessionKey({ sub: "user-a", session_id: "session-a" });
  const proof = sealRecovery("session", key, 30);
  assert.equal(checkRecovery(proof, "session", key), true);
  assert.equal(checkRecovery(proof, "session", "user-a:other-session"), false);
  assert.equal(checkRecovery(proof, "session", "user-b:session-a"), false);
  assert.equal(checkRecovery(proof, "verifier", key), false);
  assert.equal(
    checkRecovery(sealRecovery("session", key, 0), "session", key),
    false,
  );
});

test("Vercel callback URLs never fall back to localhost", () => {
  const hosted = {
    VERCEL: "1",
    VERCEL_PROJECT_PRODUCTION_URL: "codedojo.example",
  };
  assert.equal(
    resolveAuthOrigin({
      ...hosted,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    }),
    "https://codedojo.example",
  );
  assert.equal(
    resolveAuthOrigin({
      ...hosted,
      NEXT_PUBLIC_APP_URL: "https://custom.example",
    }),
    "https://custom.example",
  );
  assert.equal(
    resolveAuthOrigin({ VERCEL_ENV: "production" }, "http://localhost:3000"),
    null,
  );
  assert.equal(
    resolveAuthOrigin({}, "http://127.0.0.1:3001"),
    "http://127.0.0.1:3001",
  );
  assert.equal(resolveAuthOrigin({ NODE_ENV: "production" }), null);
});
