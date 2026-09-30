# Product Requirements Document (PRD)

## Project: RecruitCraft - AI Recruitment Sandbox & Interview Lab

**Status:** Production Ready  
**Version:** 2.0.0 (Monorepo & Resilient Dual-Engine Architecture)  
**Target Platform:** Web (Vite + React 19 + Express + Node.js Monorepo)  
**Primary AI Engine:** Google GenAI SDK (`@google/genai`)  
**Fallback AI Engine:** OpenAI-Compatible Provider (`openai` SDK / OpenRouter / Groq / vLLM / Ollama)  

---

## 1. Executive Summary & Vision

RecruitCraft transforms unstructured, chaotic hiring manager notes (Slack messages, wishlists, technical requirements, team quirks) into two synchronized, executive-grade hiring assets:
1. **A Polished LinkedIn Job Description**: Formatted specifically for LinkedIn's feed algorithm, reader attention spans, candidate conversion, and transparent competency expectations.
2. **A 10-Question Behavioral Interview Guide**: Exactly 10 structured behavioral questions mapped directly to the hard and soft skills extracted from the new JD, complete with interviewer intents, surgical follow-up probes, and 3-tier STAR rubrics (Strong Signal, Acceptable Signal, Red Flags).

Version 2.0 introduces:
- **Modular Monorepo Architecture**: Decoupled into `@recruitcraft/shared`, `@recruitcraft/ai-core`, `@recruitcraft/server`, and `@recruitcraft/client`.
- **Resilient Dual-Engine AI Architecture**: Seamless OpenAI-compatible fallback layer guaranteeing 100% uptime even if primary Google Gemini quotas are exhausted (HTTP 429) or rate-limited.
- **AI Bar Raiser Candidate Answer Simulator**: Real-time evaluation of candidate answers against STAR rubrics.
- **Multi-Turn Recruiting Copilot**: Role-based assistant with High Thinking Mode (`ThinkingLevel.HIGH`).

---

## 2. Target Personas

1. **Hiring Managers & Engineering Leads**: Need to convert messy technical requirements into clear competency bars and calibrated behavioral questions without spending hours writing JDs.
2. **Technical Talent Acquisition (TA) Partners**: Need high-converting LinkedIn copy, transparent leveling benchmarks, and outbound sourcing strategies (InMails, Boolean search strings).
3. **Interview Loops & Bar Raisers**: Need objective, standardized evaluation rubrics for both hard and soft skills with clear red flags and follow-up probes to eliminate unstructured, biased interviews.

---

## 3. Core Problems & Solutions

| Problem | Traditional Pain Point | RecruitCraft Solution |
| :--- | :--- | :--- |
| **Messy Raw Inputs** | Hiring managers write disjointed notes, leading to generic copy-pasted JDs. | An interactive sandbox with role presets and automated competency deconstruction. |
| **Poor LinkedIn Conversion** | Walls of text that fail on mobile and LinkedIn feed algorithms. | Formatted LinkedIn posts with high-converting hooks, emojis, transparent comp, and char counters. |
| **Uncalibrated Interviews** | Interviewers ask random brainteasers or unstandardized questions. | 10 behavioral questions targeting the exact hard & soft skills in the JD with STAR rubrics. |
| **Subjective Evaluation** | Candidate grading varies wildly between interviewers. | Interactive 1-5 star ratings, live note-taking, and AI Bar Raiser STAR evaluation. |
| **AI Quota & Service Outages** | API rate limits (HTTP 429) or regional outages break recruitment tooling. | Automatic fallback to any OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, local models). |
| **Monolithic Code Sprawl** | Full-stack AI apps get tightly coupled and brittle over time. | Clean monorepo structure with isolated shared domain, AI core, server, and client packages. |

---

## 4. Functional Specifications

### 4.1. Raw Notes Sandbox & Role Calibration
- **Input Field**: Monospace text area supporting free-form text, copy-pasted Slack dumps, and bullet points.
- **Real-Time Metrics**: Word count, character count, and helpful hints if input is under 15 words.
- **Calibration Selectors**:
  - *Seniority Level*: Entry/Associate (0-2 yrs), Mid-Level (2-5 yrs), Senior (5-8 yrs), Staff/Principal (8+ yrs), Engineering Manager/Director, VP/Executive.
  - *Work Model*: 100% Remote, Hybrid (2-3 days office), On-Site.
  - *LinkedIn Tone*: High-Growth Tech & Inspiring, Modern & Direct, Enterprise & Structured, Early-Stage Startup.
- **Quick Starters**: Pre-loaded real-world hiring notes:
  - *Staff Distributed Systems Engineer*
  - *Lead AI Product Manager (B2B SaaS)*
  - *Senior DevOps & Platform Security Engineer*
  - *Founding Full-Stack Growth Engineer*
- **Model & Reasoning Configuration**:
  - *High Thinking Mode Toggle*: Switches to `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` (no `maxOutputTokens`). In OpenAI fallback mode, routes to `o3-mini` or designated reasoning model.
  - *Execution Model Selector*: Choose between `gemini-3.1-pro-preview` (complex tasks), `gemini-3.5-flash` (balanced), and `gemini-3.1-flash-lite` (fast).

### 4.2. Output 1: LinkedIn-Tailored Job Description
- **Rich Preview Tab**:
  - *High-Converting LinkedIn Hook*: 1-2 sentence feed opener designed to stop scrolling.
  - *Key Role Metadata Badges*: Seniority, Location, Compensation range, Employment type.
  - *Team Mission & Charter*: Purpose and context behind the role.
  - *Outcome-Driven Responsibilities*: Actionable impact bullets.
  - *Competency Separation*: Clear distinction between **Hard Skills & Technical Mastery** vs. **Soft Skills & Leadership Signals**.
  - *Bonus Qualifications & Benefits*: Nice-to-haves, culture, perks, and compensation transparency.
  - *Call to Action*: Clear application instructions and equal opportunity commitment.
- **LinkedIn Formatted Text Tab**:
  - Pre-formatted text with professional spacing, bullet points, formatting emojis, and hashtags.
  - Character count tracker with LinkedIn sweet-spot indicators (800–3,000 characters).
  - 1-click "Copy Post" with confetti visual feedback.
- **Skills Matrix Tab**:
  - Visual badges categorizing Hard Skills, Soft Skills, and Tools & Technologies.
- **AI Quick Polish Bar**:
  - One-click instant adjustments: *Boost Hook & Comp*, *Mobile Friendly (1,500 chars)*, *More Tech Rigor*.

### 4.3. Output 2: 10-Question Behavioral Interview Guide
- **Strict 10-Question Structure**: Always generates exactly 10 questions numbered 1 to 10.
- **Skill Mapping**: Balanced distribution between Hard Skills (technical decision-making, debugging, architecture, trade-offs) and Soft Skills (stakeholder management, conflict, mentorship, ambiguity).
- **Behavioral STAR Formulation**: Prompts framed as *"Tell me about a time when..."* or *"Walk me through a situation where..."*.
- **Per-Question Architecture**:
  - *Category & Target Skill Pill*: Explicitly identifies which JD skill is being tested.
  - *Interviewer Intent*: Explains the underlying signal tested.
  - *Surgical Follow-up Probes*: 2–3 follow-ups if candidate answers are vague or rehearsed.
  - *3-Tier STAR Rubric*:
    - 🟢 **Strong Signal (Green Flags)**: High ownership, quantifiable impact, humility, systems thinking.
    - 🟡 **Acceptable Signal (Yellow Flags)**: Meets baseline bar, passive voice, moderate depth.
    - 🔴 **Red Flags (Warning Signs)**: Blaming others, inability to recall technical details, hand-waving.
- **Interactive Live Interviewer Scoring**:
  - 1–5 star rating widget per question.
  - Observation / evidence notes input.
- **AI Bar Raiser Candidate Answer Simulator**:
  - Interviewers can type or paste a candidate's actual answer.
  - Calls AI to evaluate the answer against the rubric:
    * Generates a 1–5 score.
    * Breaks down Situation, Task, Action, Result (STAR).
    * Highlights strengths and concerns.
    * Generates the single best next follow-up probe.

### 4.4. Multi-Turn Recruiting Copilot Chatbot
- **Scrollable Conversation Thread**: Complete message history with user and model roles.
- **Role Personas**:
  - *Talent Acquisition Architect*: Requirements tuning, market compensation, JD adjustments.
  - *Interview Calibration Coach*: Mock interview evaluation, rubrics coaching, probing questions.
  - *Executive Sourcer & Headhunter*: High-response LinkedIn InMails, Boolean search strings.
- **High Thinking Mode**: On-demand reasoning switch using `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` (or `o3-mini` fallback).
- **Context Awareness**: Automatically passes active role title, seniority, hard/soft skills, and notes to the copilot.
- **Prompt Suggestions**: Quick chips for common recruiter workflows.

### 4.5. Candidate Scorecard & Debrief Modal
- Aggregates ratings across all 10 questions.
- Displays overall average score out of 5.0 and number of questions scored.
- Generates an automatic hiring recommendation:
  - `4.5 - 5.0`: **STRONG HIRE** (Top 5% Candidate)
  - `3.8 - 4.4`: **HIRE** (Meets & Exceeds Bar)
  - `3.0 - 3.7`: **LEANING HIRE / MIXED SIGNALS**
  - `< 3.0`: **NO HIRE** (Below Competency Bar)
- One-click copyable interview debrief formatted for Slack, Notion, Greenhouse, or Lever.

---

## 5. Technical Architecture & Monorepo Structure

### 5.1. Monorepo Package Layout
The repository is structured as an npm workspaces monorepo:

```
├── packages/
│   ├── shared/            # @recruitcraft/shared: Shared domain types, sample notes, constants
│   ├── ai-core/           # @recruitcraft/ai-core: Resilient AI engine (Google GenAI + OpenAI fallback)
│   ├── server/            # @recruitcraft/server: Express REST API router and app factory
│   └── client/            # @recruitcraft/client: Frontend React 19 UI component library
├── src/                   # Main React SPA frontend mounted by Vite
├── server.ts              # Unified full-stack server entry point (port 3000)
├── package.json           # Root workspace manifest
├── tsconfig.json          # Root TypeScript configuration with package path aliases
└── vite.config.ts         # Vite bundler configuration with Tailwind CSS v4 and package aliases
```

### 5.2. Resilient Dual-Engine AI Architecture
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
       └─────────────┬─────────────┘ └─────────────┬─────────────┘
                     │                             │
                     ├──────── Success ────────────┤
                     │                             │
               (Quota/Net Error)                   │
                     │                             │
                     └──────── Fallback ───────────┘
                                    │
                                    ▼
                         Unified Response Payload
                  { provider: 'google' | 'openai-compatible',
                    fallbackUsed: boolean,
                    modelUsed: string, ... }
```

### 5.3. API Endpoints
| Endpoint | Method | Purpose | Primary Model | Fallback Model |
| :--- | :--- | :--- | :--- | :--- |
| `/api/generate-recruitment-kit` | `POST` | Generates LinkedIn JD + 10-Question Guide | `gemini-3.1-pro-preview` / `gemini-3.5-flash` | `o3-mini` / `gpt-4o` |
| `/api/chat` | `POST` | Multi-turn conversational copilot | `gemini-3.1-pro-preview` / `gemini-3.5-flash` | `o3-mini` / `gpt-4o` |
| `/api/evaluate-candidate-answer` | `POST` | AI Bar Raiser STAR answer assessment | `gemini-3.5-flash` | `gpt-4o-mini` |
| `/api/polish-jd` | `POST` | Rapid tone and length adjustments | `gemini-3.1-flash-lite` | `gpt-4o-mini` |
| `/api/ai-status` | `GET` | Health check & active AI provider status | N/A | N/A |

### 5.4. Environment Variables
- `GEMINI_API_KEY`: Primary Google Gemini API key (server-side only).
- `OPENAI_API_KEY`: Fallback OpenAI or OpenAI-compatible key (server-side only).
- `OPENAI_BASE_URL`: Optional custom base URL (e.g., OpenRouter, Groq, local Ollama/vLLM, or Google's OpenAI endpoint).
- `OPENAI_MODEL`: Fallback general model (default: `gpt-4o`).
- `OPENAI_REASONING_MODEL`: Fallback reasoning model for High Thinking (default: `o3-mini`).
- `OPENAI_FAST_MODEL`: Fallback fast model (default: `gpt-4o-mini`).
- `AI_PROVIDER`: Explicitly force primary provider (`google` or `openai`).

---

## 6. Non-Functional Requirements
- **High Availability**: Zero downtime through automatic multi-provider fallback.
- **Security**: Strictly no client-side API key leakage. All LLM calls pass through `/api/*`.
- **Performance**: Sub-3 second responses for quick polish; streaming/efficient JSON parsing.
- **Port Compliance**: Dev server binds to `0.0.0.0:3000`.
- **Persistence**: Local browser persistence via `localStorage` for drafts and candidate scoring.
