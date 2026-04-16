# UX Improvements Plan — Frontend + Telegram Bot

> Generated 2026-04-12 | Status: Planning

## Context

The app is a Spanish-language date ideas manager for couples, used daily via Telegram bot and a Next.js web dashboard. The current UX works but has friction points: no feedback after actions, no loading states, basic mobile affordances, and limited bot capabilities (can't edit/delete, no confirmation, no typing indicator). This plan addresses both surfaces.

---

## Frontend Improvements

### P0 — Critical

| # | Improvement | Files | What |
|---|-------------|-------|------|
| F1 | **Toast feedback system** | New: `Toast.tsx`, `ToastProvider.tsx`. Mod: `layout.tsx`, `IdeaForm.tsx`, `IdeaList.tsx` | React context + fixed-position toast. Shows "Idea agregada/actualizada/eliminada" after every mutation. Auto-dismiss 3s. |
| F2 | **Delete confirmation dialog** | New: `ConfirmDialog.tsx`. Mod: `IdeaList.tsx` | Replace `confirm()` with styled modal showing idea title. "Cancelar" / "Eliminar" buttons, 44px+ touch targets. |
| F3 | **Loading boundaries** | New: `dashboard/loading.tsx`, `dashboard/[id]/loading.tsx`, `chat/loading.tsx` | Skeleton screens with `animate-pulse` while server components fetch data from Google Sheets. |
| F4 | **Mobile touch targets** | Mod: `IdeaCard.tsx`, `Nav.tsx`, `IdeaList.tsx`, `ChatBox.tsx`, `IdeaForm.tsx`, `login/page.tsx` | Increase all buttons/links to min 44px height (`py-2.5` / `py-3`). Pure class changes. |

### P1 — High Value

| # | Improvement | Files | What |
|---|-------------|-------|------|
| F5 | **Chat UX polish** | Mod: `ChatBox.tsx`, `chat/page.tsx` | Enter-to-send (Shift+Enter for newline), auto-scroll to newest messages, typing dots animation, timestamps, empty state with example question chips, role labels ("Tu" / "Asistente"). |
| F6 | **Empty dashboard CTA** | Mod: `IdeaList.tsx` | When 0 ideas: heading + "Nueva idea" button. When 0 filtered results: "Limpiar filtros" button. |
| F7 | **Add form guidance** | Mod: `IdeaForm.tsx` | Example entries below textarea. After save, redirect to `/dashboard/[id]` (edit page) so user can verify AI parsing. |
| F8 | **Edit page dynamic title** | Mod: `dashboard/[id]/page.tsx` | Show "Editar: {idea.title}" instead of static "Editar idea". One-line change. |
| F9 | **IdeaCard action redesign** | Mod: `IdeaCard.tsx` | Full-width split buttons with border-top separator. 44px+ touch targets each. |
| F10 | **Unsaved changes warning** | Mod: `IdeaForm.tsx` | `beforeunload` listener when form is dirty. Confirm prompt on "Cancelar" if dirty. |

### P2 — Polish

| # | Improvement | Files | What |
|---|-------------|-------|------|
| F11 | **Button spinners** | New: `Spinner.tsx`. Mod: `IdeaForm.tsx`, `login/page.tsx` | Inline SVG spinner next to loading text. |
| F12 | **Card hover/active states** | Mod: `IdeaCard.tsx` | `transition-shadow hover:shadow-md` for visual feedback. |

---

## Bot Improvements

### P0 — Critical

| # | Improvement | Files | What |
|---|-------------|-------|------|
| B1 | **Typing indicator** | Mod: `reply.ts`, `handlers/add.ts`, `handlers/query.ts` | `sendChatAction("typing")` before every AI call. ~15 lines total. |
| B2 | **Surface parse failures** | Mod: `ai.ts`, `handlers/add.ts` | When AI parsing falls back to raw text, warn user with "No pude analizar bien tu idea" + suggestion to retry or edit on web. |
| B3 | **Truncation warning** | Mod: `reply.ts` | Replace silent `"..."` with visible warning. Cut at line boundary instead of mid-word. |

### P1 — High Value

| # | Improvement | Files | What |
|---|-------------|-------|------|
| B4 | **Confirm before save** | Mod: `types/idea.ts`, `reply.ts`, `handlers/add.ts`, `router.ts`, `webhook/route.ts`. New: `pending` sheet tab | Preview parsed idea with inline keyboard (Guardar/Cancelar). Uses a `pending` sheet tab for stateless serverless persistence. Builds the callback query infrastructure reused by B5-B6. |
| B5 | **Delete via bot** | New: `handlers/delete.ts`. Mod: `router.ts` | `/delete <search>` shows matches with inline buttons, tap to delete. Depends on B4 callback infra. |
| B6 | **Paginated `/list`** | Mod: `handlers/query.ts`, `reply.ts` | Deterministic grouped list (no AI call). 10 ideas/page with Anterior/Siguiente inline buttons. |
| B7 | **Filtered `/random`** | Mod: `handlers/query.ts`, `router.ts` | `/random restaurante` — AI picks one matching idea. Falls back to unfiltered if no payload. |
| B8 | **Better help text** | Mod: `handlers/help.ts` | Rich examples for each command, showing what input format works best. |

### P2 — Polish

| # | Improvement | Files | What |
|---|-------------|-------|------|
| B9 | **Unknown command hint** | Mod: `router.ts` | In groups, reply to typo-like commands ("No conozco /addd"). |
| B10 | **Edit via bot** | New: `handlers/edit.ts`. Mod: `router.ts` | `/edit <search>` show idea, field buttons, user types new value via `forceReply`. Complex, defer. |
| B11 | **Multi-message split** | Mod: `reply.ts` | Split long responses into multiple messages at paragraph boundaries instead of truncating. |

---

## Implementation Phases

All four areas are priorities. Phases ordered by dependency chain and impact.

### Phase 1 — Quick wins, zero dependencies
- B1 typing indicator, B2 parse failure warning, B3 truncation fix, B8 help text
- F3 loading skeletons, F4 touch targets, F8 edit page title

### Phase 2 — Frontend feedback system
- F1 toast system + F2 delete confirmation dialog (toast is used by delete flow)
- F6 empty dashboard CTA, F9 card action redesign

### Phase 3 — Chat overhaul
- F5 chat UX: Enter-to-send, auto-scroll, typing dots, timestamps, empty state with chips

### Phase 4 — Bot callback infrastructure (uses `pending` sheet tab)
- B4 confirm before save (builds inline keyboard + callback query plumbing)
- B5 delete via bot, B6 paginated list, B7 filtered random

### Phase 5 — Form & remaining polish
- F7 add form guidance + redirect to edit, F10 unsaved changes warning
- F11 spinners, F12 card hover states
- B9 unknown command hint, B10 edit via bot, B11 multi-message

---

## Key Decisions

- **Bot state persistence for confirm-before-save:** Use a `pending` tab in Google Sheets. Parsed idea goes to `pending` on preview, moves to `ideas` on confirm, deleted on cancel. Fully stateless across serverless cold starts.
- **No new libraries:** All frontend improvements use pure Tailwind + React context. No component library, no form library, no toast library.
- **Enter-to-send in chat** is P1 (not P2) — user confirmed this is actively painful.

---

## New Files Summary

| File | Est. Lines | Purpose |
|------|-----------|---------|
| `app/_components/Toast.tsx` | ~40 | Success/error toast |
| `app/_components/ToastProvider.tsx` | ~30 | React context for toasts |
| `app/_components/ConfirmDialog.tsx` | ~50 | Delete confirmation modal |
| `app/_components/Spinner.tsx` | ~15 | Inline loading spinner |
| `app/dashboard/loading.tsx` | ~25 | Dashboard skeleton |
| `app/dashboard/[id]/loading.tsx` | ~20 | Edit page skeleton |
| `app/chat/loading.tsx` | ~15 | Chat skeleton |
| `src/bot/handlers/delete.ts` | ~60 | Bot delete command |

---

## Verification

- **Frontend:** Run `bun run dev`, test on mobile viewport (Chrome DevTools or real phone). Check: toast appears on add/edit/delete, skeletons show during navigation, chat shows typing dots and timestamps, Enter sends messages, touch targets are thumb-friendly.
- **Bot:** Set webhook to local tunnel (ngrok/cloudflared), send commands via Telegram. Check: typing indicator appears, parse failure shows warning, truncation warning visible, inline keyboards work for confirm/delete/pagination.
- **Build:** Run `bun run build` to catch any SSR issues with new client components.
