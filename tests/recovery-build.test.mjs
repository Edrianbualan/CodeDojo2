import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";

const endpoint = (server) => "http://127.0.0.1:" + server.address().port;
async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return endpoint(server);
}

const account = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "learner@example.test",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
};
const encode = (object) =>
  Buffer.from(JSON.stringify(object)).toString("base64url");

function credentials(session) {
  const claims = {
    sub: account.id,
    session_id: session,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode(claims),
    "synthetic-signature",
  ].join(".");
  return {
    access_token: token,
    refresh_token: "test-refresh-" + session,
    user: account,
    expires_in: 3600,
    token_type: "bearer",
  };
}

function decodeHtml(text) {
  return text.replace(
    /&(?:quot|amp|lt|gt|#x27);/g,
    (entity) =>
      ({
        "&quot;": '"',
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&#x27;": "'",
      })[entity],
  );
}

test(
  "production email confirmation and external-browser recovery stay separate",
  {
    skip: process.env.CODEDOJO_TEST_RECOVERY_BUILD !== "1",
    timeout: 45000,
  },
  async (t) => {
    let resetChallenge;
    let updatedPassword;
    let updates = 0;
    const mock = createServer(async (req, res) => {
      const path = new URL(req.url, "http://localhost").pathname;
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = raw ? JSON.parse(raw) : {};
      const reply = (status, value) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(value));
      };
      if (path === "/auth/v1/recover") {
        resetChallenge = body.code_challenge;
        return reply(200, {});
      }
      if (path === "/auth/v1/token" && body.auth_code === "valid-pkce") {
        if (
          createHash("sha256")
            .update(body.code_verifier)
            .digest("base64url") !== resetChallenge
        )
          return reply(403, { message: "Incorrect verifier" });
        return reply(200, credentials("pkce-recovery-session"));
      }
      if (path === "/auth/v1/verify") {
        if (body.type === "recovery" && body.token_hash === "reset")
          return reply(200, credentials("token-recovery-session"));
        if (body.type === "email" && body.token_hash === "signup")
          return reply(200, credentials("registration-session"));
        return reply(403, { code: "otp_expired", message: "Expired token" });
      }
      if (path === "/auth/v1/user" && req.method === "PUT") {
        updates++;
        updatedPassword = body.password;
        return reply(200, account);
      }
      if (path === "/auth/v1/user") return reply(200, account);
      if (path === "/auth/v1/logout") return reply(200, {});
      return reply(404, { message: "Unexpected route" });
    });
    const mockUrl = await listen(mock);
    t.after(() => mock.close());
    const spare = createServer();
    const base = await listen(spare);
    await new Promise((resolve) => spare.close(resolve));
    const app = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        new URL(base).port,
      ],
      {
        env: {
          ...process.env,
          NEXT_PUBLIC_APP_URL: base,
          NEXT_PUBLIC_SUPABASE_URL: mockUrl,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-test-publishable",
          AUTH_RECOVERY_SECRET: "local-integration-test-signing-secret",
          VERCEL: "",
          VERCEL_ENV: "",
          NEXT_TELEMETRY_DISABLED: "1",
        },
        stdio: "ignore",
      },
    );
    t.after(() => app.kill());
    for (let attempt = 0; ; attempt++) {
      try {
        if ((await fetch(base)).ok) break;
      } catch {
        /* Wait for the test process to listen. */
      }
      assert.ok(attempt < 40, "Next production server did not start");
      await delay(250);
    }

    function browser() {
      const jar = new Map();
      return async (path, data) => {
        const response = await fetch(base + path, {
          redirect: "manual",
          ...(data && { method: "POST", body: data }),
          headers: {
            Origin: base,
            Cookie: [...jar]
              .map(([key, value]) => key + "=" + value)
              .join("; "),
          },
        });
        for (const cookie of response.headers.getSetCookie()) {
          const [pair] = cookie.split(";");
          const separator = pair.indexOf("=");
          const name = pair.slice(0, separator);
          if (pair.endsWith("=")) jar.delete(name);
          else jar.set(name, pair.slice(separator + 1));
        }
        return response;
      };
    }

    function post(html, fields) {
      const form = new FormData();
      for (const tag of html.matchAll(/<input[^>]+>/g)) {
        const name = /\bname="([^"]+)"/.exec(tag[0])?.[1];
        const value = /\bvalue="([^"]*)"/.exec(tag[0])?.[1];
        if (name?.startsWith("$ACTION_"))
          form.append(name, decodeHtml(value ?? ""));
      }
      assert.ok(
        [...form.keys()].some(
          (key) =>
            key.startsWith("$ACTION_REF_") || key.startsWith("$ACTION_ID_"),
        ),
      );
      for (const [name, value] of Object.entries(fields)) form.set(name, value);
      return form;
    }
    const password = "Synthetic-passphrase-39";
    const location = (response) =>
      new URL(response.headers.get("location"), base).pathname +
      new URL(response.headers.get("location"), base).search;

    const registered = browser();
    const signup = await registered(
      "/auth/confirm?token_hash=signup&type=email",
    );
    assert.equal(location(signup), "/dashboard");
    assert.ok(
      !signup.headers
        .getSetCookie()
        .some(
          (value) =>
            value.startsWith("dojo-recovery=") &&
            !value.startsWith("dojo-recovery=;"),
        ),
    );
    assert.equal(
      location(await registered("/reset-password")),
      "/forgot-password?link=expired",
    );

    const installedApp = browser();
    const forgot = await (await installedApp("/forgot-password")).text();
    await installedApp(
      "/forgot-password",
      post(forgot, { email: account.email }),
    );
    assert.ok(resetChallenge);

    // The mail app opens the link in a separate browser cookie jar.
    const recovery = browser();
    const reset = await recovery(
      "/auth/confirm?token_hash=reset&type=recovery",
    );
    assert.equal(location(reset), "/reset-password");
    assert.ok(
      reset.headers
        .getSetCookie()
        .some(
          (value) =>
            value.startsWith("dojo-recovery=") && /httponly/i.test(value),
        ),
    );
    assert.equal(location(await recovery("/onboarding")), "/reset-password");
    assert.equal(
      location(await installedApp("/reset-password")),
      "/forgot-password?link=expired",
    );
    const html = await (await recovery("/reset-password")).text();
    assert.match(html, /New Password/);
    assert.match(html, /Confirm New Password/);
    assert.match(html, /aria-label="Show new password"/);
    assert.match(html, /aria-label="Show confirm new password"/);
    const denied = await registered(
      "/reset-password",
      post(html, { password, confirmPassword: password }),
    );
    assert.equal(location(denied), "/forgot-password?link=expired");
    assert.equal(updates, 0);
    const mismatch = await recovery(
      "/reset-password",
      post(html, { password, confirmPassword: "different" }),
    );
    assert.match(await mismatch.text(), /passwords do not match/);
    assert.equal(updates, 0);
    const success = await recovery(
      "/reset-password",
      post(html, { password, confirmPassword: password }),
    );
    assert.equal(location(success), "/login?password=updated");
    assert.equal(updatedPassword, password);
    assert.equal(updates, 1);
    assert.match(
      await (await recovery("/login?password=updated")).text(),
      /Password updated\. Sign in/,
    );
    assert.equal(
      location(await recovery("/reset-password")),
      "/forgot-password?link=expired",
    );

    const expired = await browser()(
      "/auth/confirm?token_hash=expired&type=recovery",
    );
    assert.equal(location(expired), "/forgot-password?link=expired");
    const wrongToken = await browser()(
      "/auth/confirm?token_hash=signup&type=recovery",
    );
    assert.equal(location(wrongToken), "/forgot-password?link=expired");

    const pkce = browser();
    const pkceForm = await (await pkce("/forgot-password")).text();
    await pkce("/forgot-password", post(pkceForm, { email: account.email }));
    assert.ok(resetChallenge);
    const exchanged = await pkce("/auth/confirm?code=valid-pkce");
    assert.equal(location(exchanged), "/reset-password");
    assert.match(
      await (await pkce("/reset-password")).text(),
      /Confirm New Password/,
    );
  },
);
