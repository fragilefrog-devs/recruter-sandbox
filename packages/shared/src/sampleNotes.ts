import { GenerationConfig } from './types.js';

export interface SampleRole {
  title: string;
  seniority: GenerationConfig['seniority'];
  workModel: GenerationConfig['workModel'];
  tone: GenerationConfig['tone'];
  rawNotes: string;
}

export const SAMPLE_ROLES: SampleRole[] = [
  {
    title: 'Staff Distributed Systems Engineer',
    seniority: 'Staff/Principal',
    workModel: 'Remote',
    tone: 'High-Growth Tech & Inspiring',
    rawNotes: `Role: Staff Distributed Systems Engineer for real-time payments platform
Team: Core Infrastructure & Ledger team (6 engineers right now, scaling to 15).
Context: We process $14B annual transaction volume with 99.999% uptime SLA. We are migrating legacy monolithic ledger services to event-driven microservices using Go, Kafka, and distributed PostgreSQL/CockroachDB.

Must have hard skills:
- 7+ years backend engineering, at least 3 years dealing with distributed consensus, high throughput low latency systems
- Strong Go (Golang) or Rust in production
- Deep Kafka experience (partitioning strategies, exactly-once semantics, consumer lag troubleshooting)
- Strong understanding of ACID transactions, distributed locking, Raft/Paxos fundamentals, and data consistency models
- Kubernetes, Terraform, AWS (us-east-1 and eu-west-1 cross-region active-active setup)

Soft skills / leadership expectations:
- Needs to mentor mid and senior engineers; run architectural design reviews without being dogmatic
- Cross-functional communication: will partner with Product, Security, and Compliance/Audit teams
- High emotional intelligence when debugging high-stress P0 production outages
- Pragmatic trade-offs: knows when good enough beats over-engineering

Quirks & perks:
- $210k - $250k base + 0.15% equity + $2,500 annual learning stipend
- 100% remote (US/Canada timezones)
- On-call rotation is once every 7 weeks, but we compensate $400/week for on-call shift
- Need someone who doesn't panic when an unexpected partition occurs at 2 AM.`
  },
  {
    title: 'Lead AI Product Manager (B2B SaaS)',
    seniority: 'Senior',
    workModel: 'Hybrid',
    tone: 'Modern & Direct',
    rawNotes: `Looking for a Lead Product Manager - Generative AI & Automation workflows
Company: Series B B2B enterprise customer support automation platform (raised $32M).
Office: Hybrid in SF (Tues/Thurs in office, 3 days remote).

The problem:
Customers love our core ticketing workflow, but our new LLM auto-agent is hallucinating in 4% of complex refund queries and enterprise security teams are blocking deployment due to data residency concerns. We need an AI PM who bridges raw AI research with enterprise guardrails.

Key Responsibilities:
- Own the roadmap for our AI Agent platform (LLM evaluation harness, retrieval augmented generation, fine-tuning feedback loops)
- Define evaluation metrics beyond accuracy: latency (P95 < 800ms), cost per resolution, compliance safety
- Work directly with design on human-in-the-loop escalation UX
- Talk to 10+ Fortune 500 VP-level buyers every month to turn customer friction into roadmap items

Required Background:
- 4-7 years in B2B SaaS Product Management, at least 1.5+ years building production applications on LLM APIs (Gemini, Claude, OpenAI)
- Strong technical fluency: can read API documentation, understands vector databases (Pinecone, pgvector), RAG architectures, and token cost economics
- Exceptional executive presence and stakeholder management
- Data-obsessed: SQL mastery and experience with Mixpanel/Amplitude

Compensation & Benefits:
- $185k - $215k base + meaningful equity + comprehensive health/vision/dental
- Annual company retreat in Hawaii or Europe`
  },
  {
    title: 'Senior DevOps & Platform Security Engineer',
    seniority: 'Senior',
    workModel: 'Remote',
    tone: 'Enterprise & Structured',
    rawNotes: `Role: Senior Platform & Cloud Security Engineer
Department: Platform Engineering
Reports to: VP of Infrastructure

Core Mission:
Our developers are shipping fast, but security and compliance (SOC2 Type II, HIPAA, ISO27001) are becoming bottlenecks. We need someone to embed security directly into developer platforms (DevSecOps) without slowing engineers down.

Hard Skills needed:
- 5+ years cloud infrastructure experience on AWS or GCP
- Deep Infrastructure as Code: Terraform, Terragrunt, Pulumi
- Container orchestration & security: Kubernetes (EKS/GKE), Cilium, Falco, Trivy, Kyverno/OPA Gatekeeper
- CI/CD pipeline security: GitHub Actions, secret scanning, Sigstore, SLSA provenance
- Python or Bash scripting for automated remediation scripts

Soft Skills:
- Empathetic security champion: doesn't act like the "Department of NO", works alongside developers to solve security together
- Clear technical documentation and runbook writer
- Ability to explain risk to non-technical legal and compliance stakeholders
- Calm under pressure during vulnerability disclosures (e.g., zero-day CVE triage)

Details:
- Compensation: $170k - $205k + equity
- Fully remote (global hiring permitted within +/- 4 hrs EST)
- Unlimited PTO with 3-week minimum required`
  },
  {
    title: 'Founding Full-Stack Growth Engineer',
    seniority: 'Mid-Level',
    workModel: 'Remote',
    tone: 'Early-Stage Startup',
    rawNotes: `Early-stage YC-backed AI consumer app looking for our first Dedicated Growth Engineer.
Current team is 4 founders/engineers. App has 120k MAU growing 35% MoM.

What you'll do:
- Run 3-5 rapid A/B experiments every single week across onboarding funnels, referral loops, paywalls, and social sharing mechanics
- Build interactive micro-tools and SEO programmatic landing pages
- Integrate PostHog, Segment, Stripe, and customer attribution models
- Move fast, write clean enough code, optimize for iteration velocity

Requirements:
- 3+ years experience with Next.js/React, TypeScript, Tailwind CSS, Node.js or Python backend
- Experience with A/B testing frameworks (Statsig, LaunchDarkly, or custom)
- High product sense: you care about conversion rates, churn, and viral loops as much as clean code
- Self-directed: you can take a vague goal like "improve day 7 retention by 4%" and come up with 3 testable hypotheses

Perks:
- $140k - $175k + 0.5% - 1.2% early equity
- High autonomy, zero bureaucracy, direct feedback from founders`
  }
];
