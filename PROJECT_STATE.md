# MiaTalk Project State

Last updated: 2026-07-08

## Current Status

Generated and verified a first-code MVP skeleton in `D:\Codex\MiaTalk`.

## Completed

- Created Next.js project files.
- Added Tailwind styling.
- Added DeepSeek `llmClient`.
- Added Supabase admin client.
- Added Unit 1 scene knowledge fallback data.
- Added default four Prompt Versions fallback data.
- Added API routes:
  - `GET /api/scenes`
  - `POST /api/sessions`
  - `POST /api/chat`
  - `POST /api/sessions/[sessionId]/end`
  - `POST /api/admin/login`
  - `GET /api/admin/sessions`
  - `GET /api/admin/prompt-versions`
  - `POST /api/admin/bootstrap`
- Added pages:
  - `/`
  - `/practice`
  - `/practice/[sceneId]`
  - `/admin/login`
  - `/admin/eval`
- Added Supabase SQL:
  - `supabase/schema.sql`
  - `supabase/seed.sql`
- Added `.env.example`.
- Added README.
- Installed npm dependencies and generated `package-lock.json`.
- Passed `npm run typecheck`.
- Passed `npm run build`.

## Next Steps

1. Fill `.env.local`.
2. Execute `supabase/schema.sql` in Supabase SQL Editor.
3. Execute `supabase/seed.sql` in Supabase SQL Editor.
4. Run `npm run dev`.
5. Test:
   - Student chat can create a session.
   - DeepSeek call returns JSON or fallback output is saved.
   - Admin login works.
   - `/admin/eval` shows sessions and prompt versions.

## Known Technical Gaps

- Prompt Version create/edit/activate/archive is not implemented yet.
- Judge evaluation API and UI are not implemented yet.
- Bad Case management UI is not implemented yet.
- Test Set and Evaluation Report pages are placeholders in the PRD only.
- Unit 2-6 are not implemented as active scenes.
- Error handling is intentionally basic for MVP generation pass 1.
- Local Windows build showed a Next.js native SWC warning, then fell back successfully and completed the build. Vercel should install its Linux SWC package during deployment.

## If Work Resumes After Token Limit

Continue from this checklist:

1. Inspect current files with `git status --short` or directory listing.
2. Run TypeScript check.
3. Fix compile errors first.
4. Implement Judge evaluation route:
   - `POST /api/admin/evaluate/ai-output/[aiOutputId]`
   - save to `evaluations`
   - optionally create `bad_cases`
5. Implement Prompt Versions management UI.
6. Add Vercel deployment notes after local run passes.

Do not regenerate the whole project from scratch unless explicitly requested. Work with the existing files.
