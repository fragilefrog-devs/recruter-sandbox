# RecruitCraft — AI Recruitment Sandbox & Interview Lab

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com)
[![Google GenAI SDK](https://img.shields.io/badge/%40google%2Fgenai-2.4+-green.svg)](https://github.com/google-gemini/generative-ai-js)
[![OpenAI SDK](https://img.shields.io/badge/OpenAI-Fallback-orange.svg)](https://platform.openai.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)

**RecruitCraft** is an executive-grade recruitment intelligence platform structured as a modular TypeScript monorepo with dual-engine AI resiliency (Google GenAI primary + OpenAI-compatible automatic fallback).

It transforms raw, unstructured hiring notes into two synchronized hiring assets:
1. **A Polished LinkedIn-Optimized Job Description**: Crafted for LinkedIn’s algorithm, candidate attention spans, compensation transparency, and conversion.
2. **A 10-Question Behavioral Interview Guide**: Exactly 10 structured behavioral questions mapped directly to the hard and soft skills extracted from the new JD, complete with surgical follow-up probes and 3-tier STAR evaluation rubrics.

The platform also includes a **Multi-Turn Recruiting Copilot Chatbot** (with role-based personas and **High Thinking Mode**) and an **AI Bar Raiser Candidate Answer Simulator**.

---

## What's New in Version 2.0

- 🏗️ **Modular Monorepo Structure**: Fully decoupled into clean npm workspaces (`@recruitcraft/shared`, `@recruitcraft/ai-core`, `@recruitcraft/server`, `@recruitcraft/client`).
- 🛡️ **Resilient Dual-Engine AI Fallback**: Automatic failover to any OpenAI-compatible provider (OpenAI `gpt-4o`/`o3-mini`, OpenRouter, Groq, local Ollama/vLLM, or Google's OpenAI-compatible endpoint) whenever Google Gemini hits rate limits (`429 RESOURCE_EXHAUSTED`), quota depletion, or network timeouts.
- 📊 **Live AI Provider Status Bar**: Real-time indicator displaying whether Google GenAI or the OpenAI fallback is actively processing requests.

---

## Architecture & Monorepo Layout

```
├── packages/
│   ├── shared/            # @recruitcraft/shared: Shared domain types, sample roles, constants
│   ├── ai-core/           # @recruitcraft/ai-core: Dual-engine AI orchestrator (Google GenAI + OpenAI)
│   ├── server/            # @recruitcraft/server: Express REST API router and app factory
│   └── client/            # @recruitcraft/client: Frontend React 19 UI component library
├── src/                   # Main React SPA frontend mounted by Vite
├── server.ts              # Unified full-stack server entry point (port 3000)
├── package.json           # Root workspace manifest with npm workspaces
├── tsconfig.json          # Root TypeScript configuration with path aliases
└── vite.config.ts         # Vite bundler configuration with Tailwind CSS v4 and package aliases
```

### Resilient Dual-Engine Flow

```
                         User Request (API Route)
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    ResilientAiService     │
                      │  (@recruitcraft/ai-core)  │
                      └─────────────┬─────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
       ┌───────────────────────────┐ ┌───────────────────────────┐
       │   GoogleGenAiProvider     │ │  OpenAiFallbackProvider   │
       │    (@google/genai SDK)    │ │       (openai SDK)        │
       │    gemini-3.1-pro-preview │ │       gpt-4o / o3-mini    │
       │    gemini-3.5-flash       │ │       gpt-4o-mini         │
       └─────────────┬─────────────┘ └─────────────┬─────────────┘
                     │                             │
                     ├──────── Success ────────────┤
                     │                             │
               (429 Quota Exceeded / Net Error)    │
                     │                             │
                     └──────── Failover ───────────┘
                                    │
                                    ▼
                         Unified Response Payload
                  { provider: 'google' | 'openai-compatible',
                    fallbackUsed: boolean,
                    modelUsed: string, ... }
```

---

## Key Features

### 1. Raw Notes Sandbox & Role Calibration
- **Messy Brain Dump Input**: Paste rough hiring notes, Slack threads, tech stack wishlists, and team quirks.
- **Pre-Loaded Role Starters**:
  - *Staff Distributed Systems Engineer* (Go/Rust, Kafka, high-throughput ledgers)
  - *Lead AI Product Manager* (LLM platforms, enterprise guardrails, RAG)
  - *Senior DevOps & Platform Security Engineer* (AWS/K8s, DevSecOps, compliance)
  - *Founding Growth Engineer* (Next.js, rapid A/B experiments, viral loops)
- **Calibration Selectors**: Seniority level (Associate to VP/Executive), Work model (Remote, Hybrid, On-Site), and LinkedIn Tone.
- **High Thinking Mode**: Uses `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` (or `o3-mini` fallback) for deep reasoning into competency traps and calibrated STAR rubrics.

### 2. Output 1: LinkedIn-Tailored Job Description
- **Rich Preview Card**:
  - High-converting feed hook to capture passive candidate attention.
  - Role metadata badges: Seniority, Location, Compensation range, Employment type.
  - Clear separation of **Hard Skills & Technical Mastery** vs. **Soft Skills & Leadership Signals**.
  - Transparent compensation, benefits, and equal opportunity CTA.
- **Ready-to-Paste Formatted Text**:
  - Formatted with emojis, clean section line breaks, and hashtags.
  - Real-time character count tracker with LinkedIn feed sweet-spot indicators (800–3,000 characters).
  - 1-click copy with confetti confirmation.
- **AI Quick Polish Bar**: Instant adjustments (*⚡ Boost Hook & Comp*, *📱 Mobile Friendly*, *🛠️ More Tech Rigor*).

### 3. Output 2: 10-Question Behavioral Interview Guide
- **Strict 10-Question Structure**: Exactly 10 questions mapped directly to the skills specified in the new JD.
- **STAR Behavioral Prompts**: Formulated as *"Tell me about a time when..."* or *"Walk me through a situation where..."*.
- **Comprehensive Question Anatomy**:
  - **Target Skill**: Explicit mapping to the specific JD competency (Hard or Soft).
  - **Interviewer's Intent**: Explains why the question is asked and what capability is evaluated.
  - **Surgical Follow-up Probes**: 2–3 targeted follow-up questions to drill into depth.
  - **3-Tier STAR Evaluation Rubric**:
    - 🟢 **Strong Signal (Green Flags)**: High personal ownership, quantifiable metrics, systemic thinking.
    - 🟡 **Acceptable Signal (Yellow Flags)**: Baseline execution, passive voice, moderate depth.
    - 🔴 **Red Flags (Warning Signs)**: Blaming colleagues, superficial answers, unaddressed tech debt.
- **Live Interviewer Scoring & Notes**: Interactive 1–5 star rating and observation notes per question.
- **AI Bar Raiser**: Paste or type a candidate's actual answer to receive an instant 1–5 score, STAR breakdown, strengths, concerns, and recommended follow-up questions.

### 4. Multi-Turn Recruiting Copilot Chatbot
- **Full Conversation History**: Maintains multi-turn context across queries in a scrollable thread.
- **Role Personas**:
  - 🧠 **Talent Acquisition Architect**: Requirements tuning, market compensation, JD adjustments.
  - 🎯 **Interview Calibration Coach**: Roleplays candidate answers, grades responses against the 10 questions.
  - ⚡ **Executive Sourcer & Headhunter**: Generates personalized LinkedIn InMails and Boolean search strings.
- **Model Routing**: Select between `gemini-3.1-pro-preview` (high reasoning), `gemini-3.5-flash` (balanced), and `gemini-3.1-flash-lite` (fast) with OpenAI fallback resilience.

### 5. Candidate Scorecard & Debrief Modal
- Aggregates ratings across all 10 questions.
- Calculates overall score out of 5.0 and generates automated hiring recommendations:
  - `4.5 - 5.0`: **STRONG HIRE** (Top 5% Candidate)
  - `3.8 - 4.4`: **HIRE** (Meets & Exceeds Bar)
  - `3.0 - 3.7`: **LEANING HIRE / MIXED SIGNALS**
  - `< 3.0`: **NO HIRE** (Below Competency Bar)
- One-click copyable interview debrief formatted for Slack, Notion, Greenhouse, or Lever.

---

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/generate-recruitment-kit` | `POST` | Generates LinkedIn JD + 10-Question Guide |
| `/api/chat` | `POST` | Multi-turn recruiter copilot conversation |
| `/api/evaluate-candidate-answer` | `POST` | AI Bar Raiser STAR candidate answer evaluation |
| `/api/polish-jd` | `POST` | Fast tone and length modifications |
| `/api/ai-status` | `GET` | Health check & active AI provider status |

---

## Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
# Primary: Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# Fallback: OpenAI API Key (or OpenAI-compatible endpoint key)
# When Gemini encounters a 429 quota limit, RecruitCraft automatically fails over to this provider!
OPENAI_API_KEY="your-openai-api-key"

# Optional: Custom OpenAI-compatible Base URL
# Examples:
#   Groq:        https://api.groq.com/openai/v1
#   OpenRouter:  https://openrouter.ai/api/v1
#   Google:      https://generativelanguage.googleapis.com/v1beta/openai/
#   Local Ollama:http://localhost:11434/v1
# OPENAI_BASE_URL="https://api.openai.com/v1"

# Optional: Fallback model overrides (default: gpt-4o, o3-mini for reasoning)
# OPENAI_MODEL="gpt-4o"
# OPENAI_REASONING_MODEL="o3-mini"
# OPENAI_FAST_MODEL="gpt-4o-mini"
```

---

## Developer Commands

```bash
# Start development server (Express + Vite middlewares on http://localhost:3000)
npm run dev

# Run TypeScript typecheck across monorepo packages
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start

# Clean build artifacts
npm run clean
```

---

## License

Apache-2.0
