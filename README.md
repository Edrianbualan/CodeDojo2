# CodeDojo

**Learn. Practice. Compete. Master.**

CodeDojo is a programming education platform in development. The landing page has a quick two-question demo. Open **Practice** for complete Predict the Output sessions with multiple-choice or written answers, explanations, and XP. The practice bank contains 560 variants from 40 original question families across Python and JavaScript.

## Run in VS Code

Install Node.js 24 LTS with npm. Open this folder in VS Code, then open **Terminal > New Terminal** from the menu. Run these commands from the folder containing this README.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Press Ctrl+C to stop the server. If port 3000 is busy, use the alternate address printed in the terminal, or run `npm run dev -- --port 3001`.

If PowerShell blocks the npm script shim, use `npm.cmd` in place of `npm`.

If PowerShell cannot find npm, run `node -v` and `npm.cmd -v`. When both checks fail, install Node.js 24 LTS with npm, then close and reopen VS Code so the terminal reloads PATH. If Node is available and this checkout already has its dependencies, you can start it directly:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

Open http://127.0.0.1:3000 after Next.js reports that it is ready.

## Quality checks

From the homepage, choose **Start Your Journey** to configure Predict the Output. Python and JavaScript currently have playable banks. Each bank supports up to 70 unique questions per difficulty before unlimited practice starts another pass. Authenticated accounts store private session summaries alongside individual answers and XP.

DojoSensei uses curated replies by default. To enable the optional local model, start Ollama with an installed model and set `TUTOR_PROVIDER=ollama` and `OLLAMA_MODEL` in `.env.local`. The default endpoint is `http://127.0.0.1:11434`. `OLLAMA_BASE_URL` accepts an HTTP loopback address. Chat text and bounded conversation context are sent to that local model when curated guidance does not cover a typed question.

Open **DojoSensei** from Predict the Output for rule-based hints, traces, and similar examples. The same panel contains the mute and volume controls for practice sound effects. Settings are saved in the browser. Practice level increases every 100 earned XP.

```powershell
npm run lint
npm run typecheck
npm run format:check
npm run build
npm start
```

With the development or production server running, open a second terminal in the same folder and run `npm test`. Tests cover the question bank, runtime outputs, database permissions, XP idempotency, and public and protected routes. Python 3 is optional for checking Python snippet outputs. For alternate ports set `$env:CODEDOJO_TEST_URL = "http://localhost:3001"` in the test terminal. Set `$env:CODEDOJO_AUTH_CONFIGURED = "true"` there if the server uses Supabase.

## Project structure

- `app/` contains routes, the shared layout, and Tailwind design tokens.
- `components/` contains reusable interface behavior, including the landing-page demo and the shared Dojo Radio player.
- `content/` contains original public demo exercises.
- `lib/output/` contains the practice bank and session selection logic.
- `supabase/migrations/` contains the profiles, attempts, and XP schema.
- `tests/` contains runtime, database, and HTTP checks.
- `next.config.ts` configures common security headers.
- `PROJECT_STATUS.md` tracks milestones, actual content counts, and verification.

The foundation uses Next.js App Router, React, strict TypeScript, Tailwind CSS, local Geist fonts, ESLint, and Prettier. Supabase Auth verifies identities and PostgreSQL Row Level Security restricts private progress. The practice route grades answers on the server. The two public demo examples include their answers in the browser bundle.

## Dojo Radio

The bottom-left player loops the supplied soundtrack at 15% volume for new visitors. If the browser blocks autoplay, the first click or tap starts playback. Use the player to pause or resume, and expand **Dojo Radio** to adjust volume, mute, or turn the music off. The browser remembers these settings, including pause and off, on refresh.

The shared player keeps its place through in-app navigation, lesson changes, and practice. A full reload begins a new playback session using the saved settings. DojoSensei and Practice Setup still control practice sound effects independently.

The original MP3 lives at `public/audio/background.mp3` and is served as a static asset. It is loaded on demand for playback and needs no environment variables, database, or audio service.

## DojoLab

Start a Predict the Output session and choose **Open in Playground**. DojoLab loads Monaco on desktop and an editable text area with automatic indentation on touch screens. The question supplies the initial source. Use Python's `input()` or JavaScript's `readline()` to read one line of standard input.

Each run uses a fresh worker in a sandboxed frame with an opaque origin. JavaScript has a no-network content policy. Python loads pinned, self-hosted Pyodide assets, and its content policy allows only those runtime files. The runtime receives source and standard input. Python downloads its runtime on first use. The browser terminates an execution after three seconds once the runtime starts, and the terminal limits captured output. Browser workers have no portable hard memory quota. Python supports the bundled standard library subset.

`npm ci` and `npm run build` prepare the Pyodide files from the dependency lockfile. If install scripts were skipped, run `node scripts/prepare-lab.mjs` before starting the development server. The browser playground requires HTTPS or localhost for clipboard functions. Running code before checking an answer marks that question as assisted practice. The account dashboard preserves earlier records without assigning them an assistance status retroactively.

## Enable accounts and saved progress

The landing page and guest practice run without configuration. For accounts, use a development Supabase project.

1. In the VS Code terminal run `Copy-Item .env.example .env.local`. Open `.env.local` in the editor and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project dashboard. Set `NEXT_PUBLIC_APP_URL` to the exact origin you use, such as `http://127.0.0.1:3000`.
2. Put the Supabase secret key (or legacy service-role key) in `SUPABASE_SERVICE_ROLE_KEY`. The server uses it for validated practice writes and confirmed account deletion. Keep it out of Git, chat, and `NEXT_PUBLIC_` variables.
3. For a fresh project, run the five files in `supabase/migrations/` in filename order. For an existing project, check the schema first using the query below and run only pending files. If the linked Supabase CLI already tracks the earlier migrations, use `supabase migration list` followed by `supabase db push`. Preserve the existing owner-only policies.
4. In Supabase Auth URL Configuration, set **Site URL** to your app origin and allow both `/auth/confirm` and `/auth/confirm?flow=recovery` on that origin. Keep Confirm email enabled for email verification.
5. For confirmation links that work when opened in a different browser, set the Confirm signup template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Set the Reset password template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. The callback also accepts PKCE codes when the browser that initiated the request opens the link.
6. Restart Next.js, create a test account, verify email delivery, finish onboarding, and answer a practice question. Open **Account** to confirm the saved attempt. Each correctly solved question earns XP once per account. The number of attempts and cumulative accuracy include retries.

Optional Google sign-in requires configuring the Google provider in the development Supabase project and setting `ENABLE_GOOGLE_AUTH=true`. A Google-only account can set a password through recovery before using password-confirmed deletion. Consult the official [Supabase server-side Auth guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs) and [password-based Auth guide](https://supabase.com/docs/guides/auth/passwords) for provider and email setup.

### Production password recovery

1. In **Vercel → Project Settings → Environment Variables**, set the production `NEXT_PUBLIC_APP_URL` to the exact HTTPS origin of CodeDojo, such as `https://your-project.vercel.app`. If the explicit origin is missing or points to localhost, a Vercel deployment uses `VERCEL_PROJECT_PRODUCTION_URL` when available. Set the optional server-only `AUTH_RECOVERY_SECRET` to a random value of at least 32 bytes, or keep the existing `SUPABASE_SERVICE_ROLE_KEY` configured. The signing secret must stay stable across requests.
2. In **Supabase → Authentication → URL Configuration**, set **Site URL** to the same origin. In **Redirect URLs**, allow that origin with both `/auth/confirm` and `/auth/confirm?flow=recovery`.
3. In **Supabase → Authentication → Email Templates**, set the **Reset password** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. Keep **Confirm signup** on `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. These are email template link targets. Leave the Gmail SMTP settings as they are.
4. After deploying the updated code, request a fresh link through **Forgot password?**. A verified recovery link opens the password form before onboarding. Updating the password signs out the recovery session and returns to sign-in. Older PKCE links requested before this release may require a fresh request.

The recovery form is available for up to 15 minutes after verification and is tied to that Supabase session. Test the local production build against the included Supabase fixture by running `npm run build`, then setting `$env:CODEDOJO_TEST_RECOVERY_BUILD = "1"` and running `node --test tests/recovery-build.test.mjs`. [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates) · [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)

### Diagnose profile and progress errors

Open Supabase **SQL Editor**, run this read-only query, and look for null entries.

```sql
select
  to_regclass('public.profiles') as profiles,
  to_regclass('public.output_attempts') as output_attempts,
  to_regclass('public.output_xp') as output_xp,
  to_regclass('public.training_summaries') as training_summaries,
  to_regclass('public.academy_progress') as academy_progress,
  to_regprocedure('public.output_progress()') as output_progress,
  to_regprocedure('public.learning_dashboard()') as learning_dashboard,
  to_regprocedure('public.record_output_answer_with_assistance(uuid,uuid,text,text,text,text,boolean,boolean)') as record_assisted_answer,
  to_regprocedure('public.record_academy_progress(uuid,text,text,integer,boolean,integer)') as record_academy_progress;
```

If a migration was partially applied, compare the existing tables, functions, grants, and policies to that migration before running its remaining statements. After applying the missing changes, run `notify pgrst, 'reload schema';` if the app still reports a schema-cache error. A signed-in account with no profile row goes to onboarding.

In Vercel **Project Settings → Environment Variables**, verify that the URL, publishable key, and server-only secret all come from the same Supabase project. Set `NEXT_PUBLIC_APP_URL` to the Vercel origin and add that origin's auth callback URLs in Supabase. Changes to public build variables take effect with the next approved build. Use Node.js 24 for installation and builds. [Supabase API keys](https://supabase.com/docs/guides/api/api-keys) · [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## CodeDojo Academy

Open **Learn** for the Python and JavaScript courses or use **Start Your Journey** to choose between courses, practice, and your last saved lesson. Python has 12 lessons and JavaScript has 11. Each course includes three module projects, three module quizzes, and one final assessment. C, C++, Java, HTML, CSS, PHP, and SQL are listed as unavailable.

Use **Open in Playground** to run a worked example or edit an exercise. DojoLab compares actual output with the displayed sample. For exercises that call `input()` or `readline()`, enter the sample value in Standard input. A sample match helps check that case. It does not validate every possible input. DojoSensei uses curated lesson context and can explain runtime errors when you share them using the playground button.

A correct lesson check marks a lesson complete. Module quizzes and final assessments require at least 80%. Course percentage measures completed lessons. Module completion also requires the module quiz, and the course badge requires all modules and the final. Each course shows estimated time and a completion streak measured in UTC days. Guests can read, run, and grade lessons. Accounts save attempts, best scores, the last accessed item, and Academy XP. Practice XP stays in its own ledger.

### Enable Academy persistence

1. In the development Supabase project, open **SQL Editor** and run `supabase/migrations/202611270003_academy.sql` once. Keep the earlier migrations applied. If the project uses a tracked Supabase CLI migration history, use `supabase migration list` to confirm it is pending, then `supabase db push` against the development project.
2. Verify `select to_regclass('public.academy_progress');` returns `academy_progress`. If PostgREST reports the new objects are missing from the schema cache, run `notify pgrst, 'reload schema';`.
3. Keep the existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` for the same project. Academy needs no additional environment variables.
4. Sign in with a development account, pass a lesson, reload the course, and check **Continue Learning**. Retake the lesson and check that Academy XP stays the same. The migration adds only the Academy table, permission policy, and save function.

## Deployment

Admin provisioning and additional language runners belong to later milestones. DojoLab runs in the browser and uses static runtime files, so it needs no Vercel execution service or paid API.

A local production build can be tested using `npm run build` and `npm start`. Public deployment requires owner approval plus production configuration, tested authorization, and updated privacy and terms pages for the actual hosted service.
