# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Spanish-language app for couples to save and query date ideas. Two interfaces:
1. **Telegram bot** — commands in a group/DM, Gemini AI parses/queries, stores in Google Sheets.
2. **Web dashboard + chat** — Next.js App Router frontend with password auth, CRUD dashboard, and AI chat.

## Commands

```bash
bun install                        # Install dependencies
bun run dev                        # Next.js dev server (Turbopack)
bun run build                      # Next.js production build
bun run start                      # Start production server
bun run scripts/setup-sheet.ts     # One-time: create "ideas" sheet with headers in Google Sheets
```

No test runner is configured. To deploy, push to Vercel or run `vercel --prod`. After first deploy, set the Telegram webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<PROJECT>.vercel.app/api/webhook" \
  -d "secret_token=<SECRET>"
```

## Architecture

### Telegram Bot (legacy serverless function)

```
Telegram POST → api/webhook.ts → src/bot/router.ts → handler → response
```

The `api/webhook.ts` file is a standalone Vercel serverless function (not part of Next.js routing). It coexists with the Next.js app.

### Web Frontend (Next.js App Router)

```
Browser → proxy.ts (auth guard) → app/ routes → src/services/
```

- **`proxy.ts`** — Next.js proxy (middleware). Guards `/dashboard` and `/chat` routes via session cookie.
- **`app/api/auth/`** — Login/logout route handlers. Password-based auth with httpOnly cookie.
- **`app/api/ideas/`** — CRUD API for date ideas (GET, POST, PATCH, DELETE).
- **`app/api/chat/`** — Chat endpoint: receives question, returns Gemini AI response.
- **`app/dashboard/`** — Dashboard pages: list, add (`/nueva`), edit (`/[id]`).
- **`app/chat/`** — Chat page with AI query interface.
- **`app/_components/`** — Shared client components: Nav, IdeaList, IdeaCard, IdeaForm, ChatBox.

### Shared Services

- **`src/services/ai.ts`** — Gemini 2.5 Flash for parsing (`parseAddMessage`) and querying (`answerQuery`).
- **`src/services/sheets.ts`** — Google Sheets CRUD: `appendIdea()`, `getAllIdeas()`, `getIdeaById()`, `updateIdea()`, `deleteIdea()`.
- **`src/config.ts`** — Env var loader. Includes `frontendPassword` for web auth.
- **`src/types/idea.ts`** — All TypeScript interfaces: `DateIdea`, `ParsedAdd`, `SheetRow`, Telegram types.

### Key layers (bot-specific)

- **`src/bot/router.ts`** — Command dispatcher. Maps `/add`, `/query`, `/list`, `/random`, `/help` (and Spanish aliases `/buscar`, `/ayuda`) to handlers.
- **`src/bot/handlers/`** — One file per command group. Each handler calls services and replies via `src/bot/reply.ts`.

### Google Sheets schema

Sheet named `ideas`, row 1 is frozen headers. Columns A-J: `id`, `created_at`, `added_by`, `title`, `description`, `cost_tier`, `cost_exact`, `category`, `tags`, `raw_input`. Data starts at row 2.

## Environment Variables

See `.env.example`. Required: `TELEGRAM_BOT_API_KEY`, `GOOGLE_SHEET_ID`, `GEMINI_API_KEY`, `FRONTEND_PASSWORD`, and either `GOOGLE_SERVICE_ACCOUNT_JSON_B64` or both `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`.

## Important Details

- All bot and AI responses are in Spanish — system prompts enforce this.
- The AI service uses Gemini (`@google/generative-ai`), not Claude/Anthropic SDK.
- `parseAddMessage` has a JSON parse fallback: if Gemini returns invalid JSON, it uses raw input as title with default fields.
- Telegram message length limit (4096 chars) is enforced in `src/bot/reply.ts` with truncation.
- Vercel function timeout is set to 55s in `vercel.json` and via `maxDuration` in API routes that call Gemini.
- Sheets auth client is instantiated at module level to reuse across warm invocations.
- `googleapis` is in `serverExternalPackages` in `next.config.ts` — never import `src/services/sheets.ts` from client components.
- Do not import anything from `src/bot/` in web code (eagerly loads Telegram token).
- Web auth is a simple shared password stored in a cookie — personal couple's app, not production auth.
