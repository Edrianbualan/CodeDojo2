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
- `components/` contains reusable interface behavior. The output demo is the only client component on the landing page.
- `content/` contains original public demo exercises.
- `lib/output/` contains the practice bank and session selection logic.
- `supabase/migrations/` contains the profiles, attempts, and XP schema.
- `tests/` contains runtime, database, and HTTP checks.
- `next.config.ts` configures common security headers.
- `PROJECT_STATUS.md` tracks milestones, actual content counts, and verification.

The foundation uses Next.js App Router, React, strict TypeScript, Tailwind CSS, local Geist fonts, ESLint, and Prettier. Supabase Auth verifies identities and PostgreSQL Row Level Security restricts private progress. The practice route grades answers on the server. The two public demo examples include their answers in the browser bundle. Compiled and interpreted user submissions will require a separate, isolated runner.

## Enable accounts and saved progress

The landing page and guest practice run without configuration. For accounts, use a development Supabase project.

1. In the VS Code terminal run `Copy-Item .env.example .env.local`. Open `.env.local` in the editor and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project dashboard. Set `NEXT_PUBLIC_APP_URL` to the exact origin you use, such as `http://127.0.0.1:3000`.
2. Put the Supabase secret key (or legacy service-role key) in `SUPABASE_SERVICE_ROLE_KEY`. The server uses it for validated practice writes and confirmed account deletion. Keep it out of Git, chat, and `NEXT_PUBLIC_` variables.
3. In the development project's SQL Editor, run `supabase/migrations/202611260001_profiles.sql`, then `supabase/migrations/202611260002_output_progress.sql` and `supabase/migrations/202611270001_training_summaries.sql` in that order. Run each once on a fresh database. If you use a linked Supabase CLI development project, run `supabase db push` from this folder.
4. In Supabase Auth URL Configuration, set **Site URL** to your app origin and allow both `/auth/confirm` and `/auth/confirm?flow=recovery` on that origin. Keep Confirm email enabled for email verification.
5. For confirmation links that work when opened in a different browser, set the Confirm signup template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Set the Reset password template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`. The callback also accepts PKCE codes when the browser that initiated the request opens the link.
6. Restart Next.js, create a test account, verify email delivery, finish onboarding, and answer a practice question. Open **Account** to confirm the saved attempt. Each correctly solved question earns XP once per account. The number of attempts and cumulative accuracy include retries.

Optional Google sign-in requires configuring the Google provider in the development Supabase project and setting `ENABLE_GOOGLE_AUTH=true`. A Google-only account can set a password through recovery before using password-confirmed deletion. Consult the official [Supabase server-side Auth guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs) and [password-based Auth guide](https://supabase.com/docs/guides/auth/passwords) for provider and email setup.

## Deployment

Admin provisioning, isolated execution, and optional Ollama support belong to later milestones. The Supabase Free plan currently allows two active projects and pauses a project after a week of inactivity. Verify quotas and hosting terms again before release. See [Supabase pricing](https://supabase.com/pricing).

A local production build can be tested using `npm run build` and `npm start`. Public deployment requires owner approval plus production configuration, tested authorization, and updated privacy and terms pages for the actual hosted service.
