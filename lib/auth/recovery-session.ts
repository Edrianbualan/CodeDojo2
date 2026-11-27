import "server-only";
import { cookies } from "next/headers";
import { supabase } from "../supabase/server";
import {
  checkRecovery,
  recoveryCookie,
  recoverySessionKey,
} from "./recovery-proof";

export async function recoverySession() {
  const proof = (await cookies()).get(recoveryCookie)?.value;
  if (!proof) return null;
  const client = await supabase();
  if (!client) return null;
  const { data, error } = await client.auth.getClaims();
  const key = recoverySessionKey(data?.claims);
  return !error && key && checkRecovery(proof, "session", key) ? client : null;
}
