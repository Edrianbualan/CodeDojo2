import { sessionConfig } from "../output/config";

export function trainingReturn(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/practice/output?") ||
    value.length > 500
  )
    return undefined;
  const params = new URLSearchParams(value.slice("/practice/output?".length));
  const result = sessionConfig.safeParse(Object.fromEntries(params));
  if (!result.success) return undefined;
  return (
    "/practice/output?" +
    new URLSearchParams(
      Object.entries(result.data).map(([key, setting]) => [
        key,
        String(setting),
      ]),
    )
  );
}
