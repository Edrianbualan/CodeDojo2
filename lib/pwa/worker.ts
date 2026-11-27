import { createHash } from "node:crypto";

export function offlineDigest(html: string) {
  return createHash("sha256").update(html).digest("hex");
}

export function buildWorker(offlineHtml: string) {
  const source = String.raw`
const prefix = "codedojo-offline-";
const cacheName = prefix + "__REVISION__";
const offlinePath = "/offline";
const expectedDigest = "__OFFLINE_DIGEST__";
const practiceOptions = new Set(["language", "difficulty", "length", "mode", "minutes", "random", "sound", "tutor"]);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const response = await fetch(offlinePath, {
      cache: "reload",
      credentials: "omit",
      mode: "same-origin",
      redirect: "error",
    });
    if (!response.ok || response.headers.get("X-CodeDojo-Offline") !== "public-v1" ||
        response.headers.get("X-CodeDojo-Offline-Revision") !== expectedDigest) {
      throw new Error("The public offline library could not be installed.");
    }
    const cache = await caches.open(cacheName);
    await cache.put(offlinePath, response);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(prefix) && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Skip authentication links and non-document requests. Only the fixed,
  // anonymous offline document can ever be written to Cache Storage.
  if (request.method !== "GET" || request.mode !== "navigate" ||
      url.origin !== self.location.origin ||
      /^\/(auth|api|login|register|reset-password|forgot-password)(\/|$)/.test(url.pathname) ||
      (url.search && (url.pathname !== "/practice/output" ||
        [...url.searchParams.keys()].some((key) => !practiceOptions.has(key))))) return;

  event.respondWith(fetch(request).catch(async () => {
    const cache = await caches.open(cacheName);
    const page = await cache.match(offlinePath);
    return page ?? new Response("CodeDojo is offline. Reconnect and try again.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }));
});
`;
  const revision = createHash("sha256")
    .update(source)
    .update(offlineHtml)
    .digest("hex")
    .slice(0, 16);
  return source
    .replace("__REVISION__", revision)
    .replace("__OFFLINE_DIGEST__", offlineDigest(offlineHtml));
}
