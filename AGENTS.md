# AGENTS.md

Compact instructions for future AI/OpenCode agent sessions working in this repository.

---

## Developer Commands

```bash
# Start development server (runs Express + Vite middlewares on http://localhost:3000)
npm run dev

# Run TypeScript typecheck across monorepo packages / lint
npm run lint

# Build frontend production bundle into dist/
npm run build

# Start production server
npm run start

# Clean build artifacts
npm run clean
```

- **Verification Order:** Run `npm run lint` then `npm run build`. Maximize verification before restarting services.
- **Port:** The server runs on port `3000` bound to `0.0.0.0`. Do not change the port.

---

## Monorepo Architecture & Entry Points

- **Workspaces:** Configured in root `package.json` (`packages/*`):
  - `packages/shared` (`@recruitcraft/shared`): Shared TypeScript domain types, sample notes, constants.
  - `packages/ai-core` (`@recruitcraft/ai-core`): Resilient dual-engine AI orchestrator (Google GenAI primary + OpenAI-compatible fallback).
  - `packages/server` (`@recruitcraft/server`): Express routes (`/api/*`) and app factory.
  - `packages/client` (`@recruitcraft/client`): React components & UI assets.
- **Full-Stack Single Process:** `server.ts` is the root server entry point. In development (`NODE_ENV !== 'production'`), it mounts Vite in middleware mode (`vite.middlewares`). In production, it serves static files from `dist/`.
- **Frontend Entry:** `index.html` loads `/src/main.tsx` -> `/src/App.tsx`.
- **Client/Server Boundary:**
  - Client components in `src/` communicate with backend exclusively via `/api/*` routes.
  - **NEVER** import `@google/genai` or `openai` in `src/` or expose keys to the browser.
  - **NEVER** create UI inputs or forms for users to input API keys. Keys are handled via server environment (`process.env.GEMINI_API_KEY`, `process.env.OPENAI_API_KEY`).

---

## AI Services & Dual-Engine Resiliency

- **Orchestrator:** `packages/ai-core/src/resilientAiService.ts` executes Google GenAI as primary. If Google hits quota limits (HTTP 429 `RESOURCE_EXHAUSTED`), 403, or network timeout, it automatically fails over to `OpenAiFallbackProvider`.
- **Google GenAI Guidelines:**
  - Always instantiate with User-Agent telemetry:
    ```ts
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    ```
  - Models: `gemini-3.1-pro-preview` (complex tasks / high thinking), `gemini-3.5-flash` (balanced), `gemini-3.1-flash-lite` (fast).
  - **High Thinking Mode:** `{ thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }` with **NO** `maxOutputTokens`.
- **OpenAI-Compatible Fallback Guidelines:**
  - Uses `openai` SDK (`OpenAiFallbackProvider`).
  - Supports `OPENAI_API_KEY`, `OPENAI_BASE_URL` (compatible with OpenAI, Groq, OpenRouter, Ollama/vLLM, or Google's OpenAI endpoint).
  - Models: `OPENAI_MODEL` (`gpt-4o`), `OPENAI_REASONING_MODEL` (`o3-mini`), `OPENAI_FAST_MODEL` (`gpt-4o-mini`).

---

## Styling & Toolchain Quirks

- **Tailwind CSS v4:** Uses `@import "tailwindcss";` in `src/index.css` with `@tailwindcss/vite` plugin in `vite.config.ts`. There is no `tailwind.config.js`.
- **Metadata:** Maintain `"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"` in `metadata.json`. Never rename the app name in `metadata.json`.
- **HMR:** HMR is disabled in AI Studio when `DISABLE_HMR=true`. Do not alter the HMR guard in `vite.config.ts`.
