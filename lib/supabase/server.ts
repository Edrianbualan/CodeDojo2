import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { authConfig } from "./config";

export async function supabase() {
  const config = authConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          // Proxy refreshes cookies for read-only Server Components.
        }
      },
    },
  });
}

export function serviceClient() {
  const config = authConfig();
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !secret) return null;
  return createClient(config.url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function account() {
  const client = await supabase();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  return user ? { client, user } : null;
}
