export function accountIssue(error: { code?: string } | null | undefined) {
  if (
    error?.code &&
    ["42P01", "42703", "42883", "PGRST202", "PGRST204", "PGRST205"].includes(
      error.code,
    )
  )
    return "schema";
  if (error?.code === "42501") return "permissions";
  return "connection";
}
export const accountHelp = {
  schema:
    "The Supabase schema is missing a table, column, or function. Apply the pending CodeDojo migrations in order, then refresh the PostgREST schema cache.",
  permissions:
    "Supabase rejected the account query. Check the authenticated grants and owner-only policies in the CodeDojo migrations.",
  connection:
    "Check the Supabase project URL and publishable key, then try again.",
} as const;
