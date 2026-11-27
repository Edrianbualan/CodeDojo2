import { redirect } from "next/navigation";
import { OutputSession } from "../../../components/output-session";
import { authConfig } from "../../../lib/supabase/config";
import { account } from "../../../lib/supabase/server";
import { languages, type Language } from "../../../lib/output/types";
import { sessionConfig } from "../../../lib/output/config";
import { selectQuestions } from "../../../lib/output/bank";
import { ollamaEnabled } from "../../../lib/sensei/ollama";

export const metadata = { title: "Predict the Output" };

export default async function OutputPractice({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const configResult = sessionConfig.safeParse(await searchParams);
  const config = configResult.success ? configResult.data : undefined;
  const configured = Boolean(authConfig());
  const session = configured ? await account() : null;
  if (configured && !session) {
    const query = config
      ? "?" +
        new URLSearchParams(
          Object.entries(config).map(([key, value]) => [key, String(value)]),
        )
      : "";
    redirect(
      "/login" +
        (query
          ? "?next=" + encodeURIComponent("/practice/output" + query)
          : ""),
    );
  }
  let preferredLanguage: Language = "Python";
  let initialXp: number | null = 0;
  if (session) {
    const [profile, progress] = await Promise.all([
      session.client
        .from("profiles")
        .select("preferences")
        .eq("id", session.user.id)
        .maybeSingle(),
      session.client.rpc("output_progress"),
    ]);
    const { data } = profile;
    initialXp = progress.error
      ? null
      : ((progress.data ?? []) as { xp: number }[]).reduce(
          (sum, row) => sum + Number(row.xp),
          0,
        );
    preferredLanguage =
      languages.find((language) => data?.preferences.includes(language)) ??
      preferredLanguage;
  }
  return (
    <section className="wrap section dojo-narrow dojo-practice-page">
      <h1>Predict the Output</h1>
      <p className="intro">
        Read each snippet, predict what it prints, and trace the result after
        you answer.
      </p>
      {configured && !process.env.SUPABASE_SERVICE_ROLE_KEY ? (
        <p className="card">
          Practice is paused until the project’s server-only Supabase key is
          configured so your results can be saved.
        </p>
      ) : (
        <OutputSession
          modelEnabled={ollamaEnabled()}
          config={config}
          initialPrompts={
            config
              ? selectQuestions(
                  config.language,
                  config.difficulty,
                  config.length === "unlimited" ? 70 : config.length,
                  [],
                  config.random === "on",
                )
              : undefined
          }
          saved={configured}
          preferredLanguage={preferredLanguage}
          initialXp={initialXp}
        />
      )}
    </section>
  );
}
