import { offlineDocument } from "../../lib/pwa/offline";
import { offlineDigest } from "../../lib/pwa/worker";

export const dynamic = "force-static";

export function GET() {
  const html = offlineDocument();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "X-CodeDojo-Offline": "public-v1",
      "X-CodeDojo-Offline-Revision": offlineDigest(html),
    },
  });
}
