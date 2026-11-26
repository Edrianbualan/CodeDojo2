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

## Later roadmap

1. **Phase 4** — Learning paths, daily challenges, broader XP and achievements, rankings, and advanced analytics.
2. **Phase 5** — Monaco, isolated execution, executable challenges, SQL Arena, algorithm lab, and code puzzles.
3. **Phase 6** — Realtime battles, interviews, and optional local-model support for DojoSensei.
4. **Phase 7** — Admin, content management, production security and accessibility testing, and deployment documentation.

Public deployment and production database changes require owner approval.

## Verification

- ESLint, Prettier, strict TypeScript, the production build, and all 19 automated tests passed for the training upgrade.
- Browser verification followed Start Your Journey through a five-question session, wrong feedback, typed help, retry, correct feedback, previous and next navigation, four skips, and the final assistance count. The setup and tutor also fit at 390 CSS pixels.
- Browser checks covered contextual hints, similar examples, answer explanations, mute controls, correct and incorrect reactions, the 100-XP level-up, and session completion. At 390 CSS pixels, the tutor sat below the exercise without horizontal overflow.
- The browser completed a 10-question local session and displayed the final score, accuracy, and XP. It exercised Next Question, retry, restart, exit, a 50-question JavaScript Expert setup, and written-answer feedback in a 20-question session.
- Python and JavaScript runtime tests checked all 560 generated snippets against their expected outputs. Selection tests covered all language, difficulty, and session length combinations and checked that the public prompts omit answers.
- Local PostgreSQL tests ran all three migrations and verified owner-only access, private session summaries, duplicate protection, and idempotent XP.
- Live Supabase and hosted email delivery are pending development project configuration.
