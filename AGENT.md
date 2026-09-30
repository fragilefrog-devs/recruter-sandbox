# AGENT.md

Compact instructions for future AI/OpenCode agent sessions working in this repository.

See [AGENTS.md](./AGENTS.md) for the primary documentation.

---

## Quick Reference

- **Development Server:** `npm run dev` (runs `tsx server.ts` on `http://localhost:3000` with Vite dev middlewares)
- **Typecheck & Lint:** `npm run lint` (`tsc --noEmit` across all monorepo packages)
- **Production Build:** `npm run build` (`vite build`)
- **Production Start:** `npm run start` (`tsx server.ts`)
- **Port:** Port 3000 (`0.0.0.0`) must be preserved.

## Architecture

- Monorepo structure with `@recruitcraft/shared`, `@recruitcraft/ai-core`, `@recruitcraft/server`, and `@recruitcraft/client`.
- Full-stack Express + Vite application in a single unified process (`server.ts`).
- Dual-Engine Resilient AI layer (`packages/ai-core`): Google GenAI primary with automatic failover to OpenAI-compatible fallback on quota exhaustion (HTTP 429).
- Client files in `src/` must **never** import `@google/genai` or `openai` or expose API keys.
- High Thinking mode uses `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` (or `o3-mini` fallback) and **NO** `maxOutputTokens`.
