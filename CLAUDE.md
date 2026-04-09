# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Spanish-language Telegram bot for couples to save and query date ideas. Users send commands in a Telegram group/DM, the bot uses Gemini AI to parse/query, and stores everything in Google Sheets.

## Commands

```bash
bun install                        # Install dependencies
bun run build                      # TypeScript compile (tsc) to dist/
bun run scripts/setup-sheet.ts     # One-time: create "ideas" sheet with headers in Google Sheets
```

No test runner is configured. To deploy, push to Vercel or run `vercel --prod`. After first deploy, set the Telegram webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<PROJECT>.vercel.app/api/webhook" \
  -d "secret_token=<SECRET>"
```

## Architecture

**Single serverless function** (`api/webhook.ts`) receives Telegram webhook POSTs and delegates to the bot router.

```
Telegram POST → api/webhook.ts → src/bot/router.ts → handler → response
```

### Key layers

- **`api/webhook.ts`** — Vercel serverless entry point. Parses raw HTTP body, calls router, always returns 200.
- **`src/bot/router.ts`** — Command dispatcher. Maps `/add`, `/query`, `/list`, `/random`, `/help` (and Spanish aliases `/buscar`, `/ayuda`) to handlers. Free text in DMs is treated as a query; free text in groups is ignored.
- **`src/bot/handlers/`** — One file per command group. Each handler calls services and replies via `src/bot/reply.ts`.
- **`src/services/ai.ts`** — Gemini 2.5 Flash for both parsing (`parseAddMessage`) and querying (`answerQuery`). System prompts enforce Spanish output and structured JSON.
- **`src/services/sheets.ts`** — Google Sheets API via service account JWT. `appendIdea()` writes rows, `getAllIdeas()` reads up to 100 most recent.
- **`src/config.ts`** — Env var loader. Supports `GOOGLE_SERVICE_ACCOUNT_JSON_B64` (base64 JSON, used in Vercel) with fallback to individual `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` (local dev).
- **`src/types/idea.ts`** — All TypeScript interfaces: `DateIdea`, `ParsedAdd`, `SheetRow`, Telegram types.

### Google Sheets schema

Sheet named `ideas`, row 1 is frozen headers. Columns A-J: `id`, `created_at`, `added_by`, `title`, `description`, `cost_tier`, `cost_exact`, `category`, `tags`, `raw_input`. Data starts at row 2.

## Environment Variables

See `.env.example`. Required: `TELEGRAM_BOT_API_KEY`, `GOOGLE_SHEET_ID`, `GEMINI_API_KEY`, and either `GOOGLE_SERVICE_ACCOUNT_JSON_B64` or both `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`.

## Important Details

- All bot responses are in Spanish — system prompts enforce this.
- The AI service uses Gemini (`@google/generative-ai`), not Claude/Anthropic SDK despite the plan doc mentioning Claude.
- `parseAddMessage` has a JSON parse fallback: if Gemini returns invalid JSON, it uses raw input as title with default fields.
- Telegram message length limit (4096 chars) is enforced in `src/bot/reply.ts` with truncation.
- Webhook secret token validation is currently commented out in `api/webhook.ts` (marked TODO).
- Vercel function timeout is set to 55s in `vercel.json`.
- Sheets auth client is instantiated at module level to reuse across warm invocations.
