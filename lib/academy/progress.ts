import "server-only";
import { account } from "../supabase/server";
import type { Progress } from "./types";

export async function academyProgress() {
  const session = await account();
  if (!session)
    return { signedIn: false, error: false, records: [] as Progress[] };
  const { data, error } = await session.client
    .from("academy_progress")
    .select(
      "course_id,item_id,last_accessed_at,completed_at,best_score,attempts,xp",
    )
    .eq("user_id", session.user.id);
  return {
    signedIn: true,
    error: Boolean(error),
    records: (data ?? []) as Progress[],
  };
}
