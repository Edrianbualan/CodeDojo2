# CodeDojo project status

## Phase 1 — Foundation complete

- Next.js App Router, React, strict TypeScript, Tailwind CSS, local Geist fonts, ESLint, Prettier, and local Git.
- Dark landing page, navigation, legal pages, custom 404, and error boundary.
- The landing page still has its original two-question Python and JavaScript demo.

## Phase 2 — Account implementation in place, live verification pending

- Supabase SSR session handling, email signup and confirmation, sign-in, logout, password recovery, optional Google sign-in, protected routes, onboarding, profile editing, and password-confirmed account deletion.
- The profiles migration adds unique usernames, private preferences, server-side validation, and owner-only database access.
- No development Supabase project is configured in this checkout. Live signup, email delivery, password recovery, Google OAuth, authenticated writes, and account deletion still need testing against a development project. See README.md for the setup steps.
- Optional profile pictures are deferred.

## Phase 3 — Predict the Output implemented, core MVP in progress

- Separate practice route at `/practice/output` with Python and JavaScript, four difficulty levels, 10-, 20-, or 50-question sessions, and multiple-choice or written answers.
- **Content:** 40 original question families produce 560 distinct snippets. Each language and difficulty pair has 70 variants. Selection shuffles by topic and prioritizes unanswered questions within the visit.
- Server-side grading returns explanations after submission. The session tracks score, accuracy, XP, and progress. Learners can review missed questions, restart with a fresh selection, or exit.
- Signed-in persistence stores each attempt as it happens and awards XP once per question per account. The dashboard shows attempts, accuracy, and XP by language and difficulty. Local guest practice tracks results in memory.
- Remaining core MVP work includes code typing, Debug Rush, syntax exercises, quizzes, broader language coverage, and dashboard metrics for those modes.

## DojoSensei — Available in Predict the Output

- The tutor uses the supplied transparent reference sheet directly. Its five pixel-art poses display in a dedicated desktop rail and below the exercise on smaller screens.
- Contextual tutoring is rule-based and uses the current question's topic, code, and explanation. Hints and similar examples leave the current answer hidden. An explicit answer request reveals it.
- The tutor reacts to correct and incorrect answers, hints, session completion, and each 100 earned practice XP. The existing practice grading and reward rules continue to apply.
- Eight short Web Audio cues cover tutor and practice interactions. Sound starts muted, and the browser saves the mute and volume settings. Animations respect reduced-motion settings.
- Files added include `components/dojo-sensei.tsx`, its CSS module, `lib/sensei/`, `public/dojo-sensei/reference.png`, and `tests/sensei.test.mjs`. The practice route, server actions, session component, and shared styles integrate the tutor. No database migration is required.

## Training and tutor upgrade

- Start Your Journey and Practice open `/practice/setup`. Predict the Output supports Python and JavaScript with four difficulties, presets, a custom count up to 70, and unlimited practice in successive passes through the bank. The language selector identifies tracks that need content.
- The session honors mixed answers, ordered or shuffled questions, a time limit, sound, and tutor settings. It supports previous, next, skip, retry, restart, and exit. Incorrect feedback gives a hint and puts the solution behind an explicit request.
- DojoSensei accepts typed messages, keeps a scrollable conversation, and offers collapsible quick actions. The curated tutor is available locally. The optional Ollama adapter uses a server-only loopback address and bounded conversation history.
- Results report elapsed time, correct answers, incorrect attempts, skips, assistance, topics, and practice XP. The training summaries migration stores a private record per completed session for signed-in users. XP still comes from the verified per-answer ledger.
- The project now uses locally hosted Pixelify Sans for display text, layered training cards, and reduced-motion-aware feedback dialogs. Ollama and authenticated redirects still need live service verification.

## DojoLab and account dashboard

- Predict the Output now includes question-code copy, a collapsible DojoLab editor, and Python and JavaScript execution in an opaque browser frame with a disposable worker. Monaco loads on supported desktops. Touch devices use an auto-indenting text area. DojoLab includes standard input, error and output displays, cancellation, a timeout, fullscreen, and DojoSensei explanations.
- The runner uses locally installed Pyodide static files. It limits source and captured output, and its network policy permits only the Python runtime files. Browser workers have no portable hard memory limit.
- The new account migration persists assistance on each graded answer, preserves unknown assistance for older attempts, and feeds the dashboard with unique completions, XP, UTC activity, streaks, and session history. The dashboard calculates rank and achievements from those records.
- The account page now provides separate diagnostics for missing schema objects, database permissions, and connection errors. This checkout has no live Supabase credentials or production Git remote. The exact hosted cause and authenticated dashboard still need live verification. README.md contains the read-only schema preflight and migration steps.
- Browser checks passed for Python, JavaScript input, syntax errors, cancellation, execution timeout, tutor explanations, and fullscreen chat at 320 CSS pixels. Production-build checks confirmed Python, JavaScript network restrictions, the terminal output cap, and the 768px layout. Local PostgreSQL tests passed for all four migrations, assistance isolation, unique completion, and duplicate XP protection.

## Password recovery

- Registration confirmation and password recovery use separate callback paths after Supabase verifies the link. A signed, short-lived recovery cookie binds password updates to the verified Supabase session. Same-browser PKCE recovery also works when the callback loses its recovery query marker.
- The recovery page includes matching password fields and visibility controls. A successful update clears the browser recovery session and returns the user to sign-in. Invalid and expired links lead back to the request form.
- Production redirect configuration and email template targets are documented in README.md. Verification uses a local Supabase Auth fixture with synthetic accounts. Hosted Gmail delivery and the Vercel reset flow still need a live check after the updated release.

## CodeDojo Academy

- Learn, course outlines, and Continue Learning are integrated with the homepage and account dashboard. Start Your Journey links to learning, practice setup, and resume.
- Python has 12 lessons and JavaScript has 11 across Beginner, Intermediate, and Advanced. The courses include 46 worked examples, 23 lesson checks, six module projects and quizzes, and two final assessments. Remaining language courses are identified as unavailable.
- Lessons reuse DojoLab and DojoSensei for editing, execution, sample-output checks, and curated help. Project evaluation compares the displayed sample output.
- A new additive migration stores private course progress, last-accessed items, best scores, attempts, and one XP award per passed item. Completion, achievements, estimations, and UTC streaks are calculated from course records. Live Supabase needs the migration and a signed-in check.
- The production build, TypeScript, and all 30 automated tests passed, including password recovery regression checks. Browser testing covered the Python lesson flow, contextual help, navigation, and a JavaScript project and quiz at 320 CSS pixels. Local PostgreSQL verified account isolation and duplicate XP protection.

## Dojo Radio

- The shared layout owns one looping soundtrack player. New visitors start at 15% volume. The player attempts autoplay, retries when the browser grants a click or tap, and fades between playback states and volume changes.
- Play and pause, mute, volume, and the music switch are independent of DojoSensei sound effects. Music settings persist in local browser storage. The bottom-left player starts collapsed and respects the reduced-motion preference.
- The supplied `public/audio/background.mp3` matches the source byte for byte. The production server responds to MP3 byte-range requests. Practice Setup now submits through Next.js client navigation, retaining the player when training starts.
- Browser checks covered first-click playback, uninterrupted audio across routes and Academy lessons, opening DojoLab, answer feedback, pause and resume, saved mute, volume and off settings, and the expanded and collapsed player at 320 CSS pixels with Practice open.
- The production build, ESLint, Prettier, TypeScript, and all 35 tests passed. The suite exercises autoplay permission handling, persistent preferences, fades, and the gain fallback for devices that restrict media-element volume. Native Firefox, Safari, and mobile devices were outside this test run.

## Installable CodeDojo PWA

- Added the Next.js web app manifest, standalone display, CodeDojo pixel-brand icons, maskable PNGs, the Apple Touch Icon, and platform-aware installation help on Home and in the header. The button uses the native install prompt when available and hides in standalone.
- Mobile navigation connects Home, Learn, Practice, DojoLab, and Account. The DojoLab tab opens the existing editor with no practice question required. DojoSensei remains collapsible, and Dojo Radio stays above the bottom bar with one soundtrack across page transitions.
- The production service worker stores one versioned public document with read-only notes from all 23 Academy lessons and 46 worked examples. It verifies the document revision during install, allows old tabs to finish before activation, and removes only its own prior caches. Private responses, auth links, and personalized data are never written to Cache Storage. Existing Supabase accounts and tables are reused.
- Production build, TypeScript, ESLint, Prettier, and all 39 tests passed. Tests covered icon dimensions, service-worker revision and cache behavior, separate-browser password recovery using the Auth fixture, and private progress in local PostgreSQL.
- Browser checks verified installation help, mobile navigation and tutor at 320 and 390 CSS pixels, a Python run in DojoLab, continued radio playback, and opening a cached lesson with the preview server stopped. Native Android and desktop installation, iPhone and iPad Home Screen launches, and live Gmail/Supabase synchronization still need real-device or hosted verification.

## Later roadmap

1. **Phase 4** — Learning paths, daily challenges, broader XP and achievements, rankings, and advanced analytics.
2. **Phase 5** — Additional language runtimes, executable challenges, SQL Arena, algorithm lab, and code puzzles.
3. **Phase 6** — Realtime battles, interviews, and optional local-model support for DojoSensei.
4. **Phase 7** — Admin, content management, production security and accessibility testing, and deployment documentation.

Public deployment and production database changes require owner approval.

## Verification

- ESLint, Prettier, strict TypeScript, the production build, and all 19 automated tests passed for the DojoLab and account upgrade.
- Browser verification followed Start Your Journey through a five-question session, wrong feedback, typed help, retry, correct feedback, previous and next navigation, four skips, and the final assistance count. The setup and tutor also fit at 390 CSS pixels.
- Browser checks covered contextual hints, similar examples, answer explanations, mute controls, correct and incorrect reactions, the 100-XP level-up, and session completion. At 390 CSS pixels, the tutor sat below the exercise without horizontal overflow.
- The browser completed a 10-question local session and displayed the final score, accuracy, and XP. It exercised Next Question, retry, restart, exit, a 50-question JavaScript Expert setup, and written-answer feedback in a 20-question session.
- Python and JavaScript runtime tests checked all 560 generated snippets against their expected outputs. Selection tests covered all language, difficulty, and session length combinations and checked that the public prompts omit answers.
- Local PostgreSQL tests ran all three migrations and verified owner-only access, private session summaries, duplicate protection, and idempotent XP.
- Live Supabase and hosted email delivery are pending development project configuration.
