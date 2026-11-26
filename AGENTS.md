# CodeDojo project conventions

- Read PROJECT_STATUS.md and inspect the checkout before making changes. Continue the active milestone and preserve existing working behavior.
- Use Next.js App Router and strict TypeScript. Keep pages server-rendered by default and use client components for browser interactions.
- Maintain the dark palette, responsive layouts, visible keyboard focus, and accessible feedback. Keep learning material original.
- Install dependencies as a feature needs them. Keep package-lock.json with package.json when it is available.
- Use Supabase Auth and apply server checks and Row Level Security to private records. Keep secrets on the server. Award XP transactionally with duplicate protection.
- Keep protected challenge answers and test cases server-side. Keep untrusted code execution outside the web server and production database.
- Run lint, type checking, relevant tests, and build after each phase. Record actual results and pending work in PROJECT_STATUS.md.
- Ask the project owner before destructive operations, paid services, production database changes, or public deployment.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
