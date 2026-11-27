type Environment = {
  NEXT_PUBLIC_APP_URL?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  NODE_ENV?: string;
};

function origin(value: string | undefined, hosted: boolean) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      return null;
    if (
      hosted &&
      (url.protocol !== "https:" ||
        /^(localhost|127\.|\[::1\]$)|\.localhost$/i.test(url.hostname))
    )
      return null;
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export function resolveAuthOrigin(environment: Environment, local?: string) {
  const hosted = environment.VERCEL === "1" || Boolean(environment.VERCEL_ENV);
  const production = environment.VERCEL_PROJECT_PRODUCTION_URL;
  return (
    origin(environment.NEXT_PUBLIC_APP_URL, hosted) ??
    (hosted
      ? origin(production ? "https://" + production : undefined, true)
      : environment.NODE_ENV === "production"
        ? null
        : (origin(local, false) ?? "http://localhost:3000"))
  );
}

export function authOrigin(local?: string) {
  return resolveAuthOrigin(
    {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    local,
  );
}
