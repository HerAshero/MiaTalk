# MiaTalk

MiaTalk is a web MVP for an AI English scenario-speaking companion for Chinese primary school students. The first implemented scene is 外研版四年级下册 Unit 1: People at work.

## Stack

- Next.js
- Supabase Postgres
- DeepSeek API
- Vercel

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEFAULT_CHAT_MODEL=deepseek-v4-flash
DEFAULT_JUDGE_MODEL=deepseek-v4-flash
OPTIONAL_JUDGE_MODEL=deepseek-v4-pro
ADMIN_PASSWORD=
ADMIN_COOKIE_SECRET=
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `DEEPSEEK_API_KEY` in browser code.

4. In Supabase SQL Editor, run:

- `supabase/schema.sql`
- `supabase/seed.sql`

5. Start the app:

```bash
npm run dev
```

6. Open:

- Student side: `http://localhost:3000`
- Admin side: `http://localhost:3000/admin/login`

## Current MVP Scope

Implemented:

- Student landing page
- Scene cards
- Unit 1 chat page
- DeepSeek `llmClient`
- Supabase service client
- Session creation
- Student chat API
- Exit summary API
- Admin password login
- Admin evaluation dashboard shell
- Prompt Versions listing
- Supabase schema and seed data

Not yet fully implemented:

- Judge evaluation execution UI
- Bad Case editing UI
- Test Set UI
- Evaluation Report generation
- Prompt Version create/edit/activate/archive UI
- Full Unit 2-6 interactive scenes

## Important Data Model

- `sessions` records the session-level `prompt_version_set`.
- `turns` stores visible conversation text only.
- `ai_outputs` stores model call metadata, prompt snapshot, knowledge snapshot, raw output, and parsed JSON.
- `evaluations` stores Judge scores.
- `prompt_versions` stores four independent prompt version lines:
  - `student_main`
  - `exit_summary`
  - `judge`
  - `bad_case_rubric`

## Deployment Notes

After local MVP works:

1. Push this folder to GitHub repo `MiaTalk`.
2. Import GitHub repo in Vercel.
3. Add all `.env.local` variables to Vercel Project Settings.
4. Deploy.

## Admin Bootstrap

If Supabase seed data was not inserted manually, call this API once after setting env vars:

```bash
curl -X POST http://localhost:3000/api/admin/bootstrap
```

For production, use the Supabase SQL seed flow instead of exposing bootstrap casually.
