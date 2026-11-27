import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import manifest from "../app/manifest.ts";
import { offlineDocument } from "../lib/pwa/offline.ts";
import { buildWorker, offlineDigest } from "../lib/pwa/worker.ts";

const base = process.env.CODEDOJO_TEST_URL ?? "http://localhost:3000";

test("CodeDojo declares standalone mode and separate maskable icons", () => {
  const app = manifest();
  assert.equal(app.name, "CodeDojo");
  assert.equal(app.short_name, "CodeDojo");
  assert.equal(app.display, "standalone");
  assert.equal(app.scope, "/");
  assert.equal(app.start_url, "/");
  for (const purpose of ["any", "maskable"]) {
    assert.deepEqual(
      app.icons
        .filter((icon) => icon.purpose === purpose)
        .map((icon) => icon.sizes),
      ["192x192", "512x512"],
    );
  }
});

test("offline Academy contains all read-only lesson notes and worked examples", () => {
  const page = offlineDocument();
  assert.match(page, /Offline Academy/);
  assert.match(page, /Reconnect to sign in, save progress/);
  assert.equal([...page.matchAll(/<details>/g)].length, 23);
  assert.equal([...page.matchAll(/<h4>/g)].length, 46);
  assert.doesNotMatch(page, /<script|<form/i);
});

test("the worker keeps only the anonymous offline document and cleans up its older version", async () => {
  const origin = "https://code-dojo2.vercel.app";
  const page = "offline academy";
  const source = buildWorker(page);
  assert.notEqual(source, buildWorker(page + " revised"));
  assert.doesNotMatch(source, /skipWaiting/);
  const handlers = new Map();
  const writes = [];
  const removed = [];
  let installed;
  let network = true;
  let claimed = false;
  let offlineFetchOptions;
  let contentDigest = "previous-deployment";

  runInNewContext(source, {
    URL,
    Response,
    fetch: async (address, options) => {
      if (!network) throw new TypeError("offline");
      if (address === "/offline") {
        offlineFetchOptions = options;
        return new Response(page, {
          headers: {
            "X-CodeDojo-Offline": "public-v1",
            "X-CodeDojo-Offline-Revision": contentDigest,
          },
        });
      }
      return new Response("network response");
    },
    caches: {
      async open(name) {
        assert.match(name, /^codedojo-offline-[0-9a-f]{16}$/);
        return {
          async put(path, response) {
            writes.push(path);
            installed = await response.text();
          },
          async match(path) {
            if (path === "/offline" && installed)
              return new Response(installed);
          },
        };
      },
      async keys() {
        const revision = /prefix \+ "([0-9a-f]+)"/.exec(source)[1];
        return [
          "codedojo-offline-retired",
          "another-app",
          "codedojo-offline-" + revision,
        ];
      },
      async delete(name) {
        removed.push(name);
      },
    },
    self: {
      location: { origin },
      addEventListener: (name, handler) => handlers.set(name, handler),
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
  });

  function run(type, request) {
    let result;
    const capture = (value) => {
      result = value;
    };
    handlers.get(type)({ request, waitUntil: capture, respondWith: capture });
    return result;
  }

  await assert.rejects(run("install"), /could not be installed/);
  assert.deepEqual(writes, []);
  contentDigest = offlineDigest(page);
  await run("install");
  assert.equal(offlineFetchOptions.credentials, "omit");
  assert.equal(offlineFetchOptions.redirect, "error");
  assert.deepEqual(writes, ["/offline"]);
  await run("activate");
  assert.deepEqual(removed, ["codedojo-offline-retired"]);
  assert.equal(claimed, true);

  const request = (path, extra = {}) => ({
    url: origin + path,
    method: "GET",
    mode: "navigate",
    ...extra,
  });
  assert.equal(
    await (await run("fetch", request("/dashboard"))).text(),
    "network response",
  );
  network = false;
  for (const path of [
    "/",
    "/learn/python/hello",
    "/dashboard",
    "/practice/output?language=Python",
  ]) {
    assert.equal(await (await run("fetch", request(path))).text(), page);
  }
  for (const value of [
    request("/auth/confirm?token_hash=example"),
    request("/reset-password"),
    request("/login"),
    request("/api/progress"),
    request("/learn?_rsc=sample", { mode: "cors" }),
    request("/learn", { method: "POST" }),
    request("/learn", { url: "https://example.com/learn" }),
    request("/?code=example"),
    request("/practice/output?token_hash=example"),
  ]) {
    assert.equal(run("fetch", value), undefined);
  }
  assert.deepEqual(writes, ["/offline"]);

  installed = undefined;
  assert.equal((await run("fetch", request("/"))).status, 503);
});

test("the production site serves the manifest, PNG sizes, safe offline page and updateable worker", async () => {
  const get = (path) => fetch(base + path);
  const homepage = await (await get("/")).text();
  assert.match(homepage, /rel="manifest" href="\/manifest.webmanifest"/);
  assert.match(
    homepage,
    /rel="apple-touch-icon" href="\/pwa\/apple-touch-icon.png"/,
  );
  assert.equal(
    (await (await get("/manifest.webmanifest")).json()).display,
    "standalone",
  );
  for (const { src, sizes } of [
    ...manifest().icons,
    { src: "/pwa/apple-touch-icon.png", sizes: "180x180" },
  ]) {
    const response = await get(src);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /image\/png/);
    const image = Buffer.from(await response.arrayBuffer());
    assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(image.readUInt32BE(16) + "x" + image.readUInt32BE(20), sizes);
  }
  const fallback = await get("/offline");
  assert.equal(fallback.headers.get("x-codedojo-offline"), "public-v1");
  assert.equal(
    fallback.headers.get("x-codedojo-offline-revision"),
    offlineDigest(offlineDocument()),
  );
  assert.equal(fallback.headers.has("set-cookie"), false);
  assert.match(await fallback.text(), /Offline Academy/);
  const worker = await get("/sw.js");
  assert.equal(worker.status, 200);
  assert.equal(worker.headers.get("service-worker-allowed"), "/");
  assert.match(worker.headers.get("cache-control"), /no-store/);
  assert.match(await worker.text(), /codedojo-offline-/);
});
