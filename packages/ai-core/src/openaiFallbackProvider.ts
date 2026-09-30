import OpenAI from 'openai';
import {
  GenerateKitParams,
  GenerateKitResult,
  ChatParams,
  ChatResult,
  ChatStreamParams,
  EvaluateAnswerParams,
  EvaluateAnswerResult,
  PolishJdParams,
  PolishJdResult,
  PolishJdStreamParams,
} from './types.js';

export class OpenAiFallbackProvider {
  private client: OpenAI | null = null;
  private apiKey: string = '';
  private baseURL: string | undefined = undefined;
  private defaultModel: string = 'gemini/gemini-3.6-flash';
  private reasoningModel: string = 'gemini/gemini-3.1-pro-preview';
  private fastModel: string = 'gemini/gemini-3.5-flash-lite';

  constructor() {
    this.refreshConfig();
  }

  public refreshConfig(): void {
    this.apiKey = process.env.OPENAI_API_KEY || 'sk-0d71fb7c21ea2f91-mv2hhc-443a0a26';
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://9router-production-a99a.up.railway.app/v1';
    this.defaultModel = process.env.OPENAI_MODEL || 'gemini/gemini-3.6-flash';
    this.reasoningModel = process.env.OPENAI_REASONING_MODEL || 'gemini/gemini-3.1-pro-preview';
    this.fastModel = process.env.OPENAI_FAST_MODEL || 'gemini/gemini-3.5-flash-lite';

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
      });
    } else {
      this.client = null;
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public getModelName(type: 'default' | 'reasoning' | 'fast'): string {
    if (type === 'reasoning') return this.reasoningModel;
    if (type === 'fast') return this.fastModel;
    return this.defaultModel;
  }

  private getCandidateModels(preferred: string): string[] {
    const list = [
      preferred,
      this.defaultModel,
      this.fastModel,
      'gemini/gemini-3.6-flash',
      'gemini/gemini-3.5-flash-lite',
      'gemini/gemini-3-flash-preview',
      'openrouter/openrouter/free',
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }

  private getClient(): OpenAI {
    this.refreshConfig();
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error(
          'OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in environment or .env for OpenAI-compatible fallback.'
        );
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
      });
    }
    return this.client;
  }

  public async generateKit(params: GenerateKitParams, fallbackReason?: string): Promise<GenerateKitResult> {
    const openai = this.getClient();
    const {
      rawNotes,
      seniority = 'Senior',
      workModel = 'Hybrid',
      tone = 'High-Growth Tech & Inspiring',
      useHighThinking = false,
    } = params;

    const preferredModel = useHighThinking ? this.reasoningModel : this.defaultModel;
    const candidateModels = this.getCandidateModels(preferredModel);

    const systemPrompt = `You are a Principal Talent Acquisition Architect and Executive Technical Recruiter.
Your objective is to deconstruct raw notes about a desired role and produce two production-grade artifacts in strict JSON format:
1. A polished, high-converting Job Description strictly formatted for LinkedIn (hook, impact-driven bullets, separation of hard skills/technical mastery vs soft skills/leadership, transparent expectations, and professional formatting with emojis).
2. An Interview Guide containing EXACTLY 10 behavioral questions specifically targeting the soft and hard skills articulated in the new Job Description.

For the 10 behavioral questions:
- Exactly 10 questions numbered 1 to 10.
- Balanced coverage between Hard Skills and Soft Skills.
- Every question MUST follow the behavioral STAR framework ("Tell me about a time when...", "Walk me through a situation where...").
- For EACH question, specify targetSkill, category ('hard_skill' | 'soft_skill'), intent, followUpProbes (2-3 probes), and a 3-tier rubric (strongSignal, acceptableSignal, redFlags).

Output MUST be valid JSON with this exact structure:
{
  "jobDescription": {
    "jobTitle": "string",
    "department": "string",
    "seniority": "string",
    "employmentType": "Full-time | Contract | Part-time",
    "location": "string",
    "compensation": "string",
    "hook": "string",
    "aboutCompany": "string",
    "roleOverview": "string",
    "responsibilities": ["string"],
    "hardSkills": ["string"],
    "softSkills": ["string"],
    "niceToHaves": ["string"],
    "benefits": ["string"],
    "callToAction": "string",
    "linkedinFormattedText": "string",
    "skillsSummary": {
      "hardSkills": ["string"],
      "softSkills": ["string"],
      "toolsAndTech": ["string"]
    }
  },
  "interviewGuide": {
    "roleTitle": "string",
    "summary": "string",
    "estimatedDurationMinutes": 60,
    "targetCompetenciesOverview": [
      { "name": "string", "type": "hard_skill | soft_skill", "description": "string" }
    ],
    "questions": [
      {
        "id": 1,
        "question": "string",
        "category": "hard_skill | soft_skill",
        "targetSkill": "string",
        "intent": "string",
        "followUpProbes": ["string"],
        "rubric": {
          "strongSignal": "string",
          "acceptableSignal": "string",
          "redFlags": "string"
        }
      }
    ]
  },
  "seniorityCalibrationNotes": "string",
  "thinkingProcess": "string"
}`;

    const userPrompt = `Role Calibration Parameters:
- Target Seniority: ${seniority}
- Work Model: ${workModel}
- LinkedIn Tone: ${tone}

Raw Notes from Hiring Manager / Team:
"""
${rawNotes.trim()}
"""`;

    let lastError: unknown;
    for (const model of candidateModels) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        let parsedData: Record<string, unknown>;
        try {
          parsedData = JSON.parse(content);
        } catch {
          let cleaned = content.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          parsedData = JSON.parse(cleaned);
        }

        if (parsedData.interviewGuide && Array.isArray((parsedData.interviewGuide as { questions?: unknown[] }).questions)) {
          const guide = parsedData.interviewGuide as { questions: Record<string, unknown>[] };
          guide.questions = guide.questions.map((q, index) => ({
            ...q,
            id: index + 1,
          }));
        }

        return {
          ...(parsedData as unknown as { jobDescription: GenerateKitResult['jobDescription']; interviewGuide: GenerateKitResult['interviewGuide'] }),
          generatedAt: new Date().toISOString(),
          modelUsed: model,
          provider: 'openai-compatible',
          fallbackUsed: true,
          fallbackReason: fallbackReason || 'Executed via OpenAI-compatible endpoint',
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in generateKit:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All OpenAI-compatible candidate models failed for generateKit');
  }

  private buildChatMessages(params: ChatParams): OpenAI.Chat.ChatCompletionMessageParam[] {
    const { messages, rolePersona = 'talent_architect', roleContext } = params;

    let personaInstruction = '';
    if (rolePersona === 'interviewer_coach') {
      personaInstruction = `You are an Interview Calibration Coach and Behavioral Assessment Expert.
Your purpose is to coach hiring managers and interviewers:
- Help calibrate candidate responses against the 10 behavioral interview questions and STAR rubrics.
- Provide real-time evaluation of candidate answers (grading Situation, Task, Action, Result).
- Suggest surgical follow-up probes to test for authenticity, depth, and red flags.`;
    } else if (rolePersona === 'executive_sourcer') {
      personaInstruction = `You are an Elite Executive Talent Sourcer and Headhunter.
Your specialty is outbound talent engagement:
- Crafting hyper-personalized LinkedIn InMail and email outreach messages that achieve 40%+ response rates.
- Generating exact Boolean search strings (for LinkedIn Recruiter, GitHub, Google X-Ray) tailored to the role's hard skills.`;
    } else {
      personaInstruction = `You are a Principal Talent Acquisition Architect and Strategic Recruiting Copilot.
You assist hiring teams in refining role requirements, fine-tuning Job Descriptions for maximum LinkedIn conversion, aligning compensation benchmarks, and optimizing interview loops.`;
    }

    const contextPrefix = roleContext
      ? `CURRENT ROLE CONTEXT:
Job Title: ${roleContext.jobTitle || 'N/A'}
Seniority: ${roleContext.seniority || 'N/A'}
Work Model: ${roleContext.workModel || 'N/A'}
Core Hard Skills: ${(roleContext.hardSkills || []).join(', ')}
Core Soft Skills: ${(roleContext.softSkills || []).join(', ')}
Raw Notes Excerpt: ${roleContext.rawNotes ? roleContext.rawNotes.slice(0, 500) : 'N/A'}
---
`
      : '';

    const systemContent = `${personaInstruction}\n\n${contextPrefix}Always provide crisp, insightful, actionable responses formatted in Markdown with headings, bullet points, strategic advice, or formatted copy when appropriate.`;

    return [
      { role: 'system', content: systemContent },
      ...messages.map((m) => ({
        role: (m.role === 'model' ? 'assistant' : m.role === 'user' ? 'user' : 'system') as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];
  }

  public async chat(params: ChatParams, fallbackReason?: string): Promise<ChatResult> {
    const openai = this.getClient();
    const { useHighThinking = false } = params;
    const preferredModel = useHighThinking ? this.reasoningModel : this.defaultModel;
    const candidateModels = this.getCandidateModels(preferredModel);
    const openAiMessages = this.buildChatMessages(params);

    let lastError: unknown;
    for (const model of candidateModels) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: openAiMessages,
          temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || '';

        return {
          reply,
          modelUsed: model,
          provider: 'openai-compatible',
          fallbackUsed: true,
          fallbackReason: fallbackReason || 'Executed via OpenAI-compatible endpoint',
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in chat:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All OpenAI-compatible candidate models failed for chat');
  }

  public async chatStream(params: ChatStreamParams, fallbackReason?: string): Promise<ChatResult> {
    const openai = this.getClient();
    const { useHighThinking = false, onChunk } = params;
    const preferredModel = useHighThinking ? this.reasoningModel : this.defaultModel;
    const candidateModels = this.getCandidateModels(preferredModel);
    const openAiMessages = this.buildChatMessages(params);

    let lastError: unknown;
    for (const model of candidateModels) {
      try {
        const stream = await openai.chat.completions.create({
          model,
          messages: openAiMessages,
          temperature: 0.7,
          stream: true,
        });

        let accumulated = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            accumulated += delta;
            onChunk({ token: delta, done: false });
          }
        }

        onChunk({ token: '', done: true });

        return {
          reply: accumulated,
          modelUsed: model,
          provider: 'openai-compatible',
          fallbackUsed: true,
          fallbackReason: fallbackReason || 'Executed via OpenAI-compatible streaming',
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in chatStream:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate models failed for chatStream');
  }

  public async evaluateAnswer(params: EvaluateAnswerParams): Promise<EvaluateAnswerResult> {
    const openai = this.getClient();
    const { question, rubric, candidateAnswer, targetSkill, roleTitle } = params;

    const prompt = `You are a Senior Bar Raiser Interviewer for the role "${roleTitle || 'Target Role'}".
Evaluate the following candidate response to this behavioral interview question:

QUESTION:
"${question}"

TARGETED COMPETENCY:
"${targetSkill || 'Core competency'}"

EVALUATION RUBRIC:
- Strong Signal (Green Flags): ${rubric?.strongSignal || 'Clear STAR structure, quantifiable impact, humility, deep ownership.'}
- Acceptable Signal (Yellow Flags): ${rubric?.acceptableSignal || 'Basic response, some ambiguity, moderate execution.'}
- Red Flags: ${rubric?.redFlags || 'Deflection, blaming others, vague answers, lack of personal ownership.'}

CANDIDATE'S ACTUAL ANSWER:
"""
${candidateAnswer}
"""

Evaluate this answer rigorously using the STAR framework. Return a JSON response with this exact structure:
{
  "score": 1 to 5 (number),
  "starBreakdown": {
    "situation": "string evaluation of how clearly the context was set",
    "task": "string evaluation of the candidate's defined responsibility",
    "action": "string evaluation of the specific technical or interpersonal actions the candidate took",
    "result": "string evaluation of the quantified outcome and retrospective learning"
  },
  "strengths": ["string", "string"],
  "concerns": ["string", "string"],
  "recommendedFollowUp": "string (the single best follow-up question the interviewer should ask right now to verify this answer)"
}`;

    const candidateModels = this.getCandidateModels(this.fastModel);
    let lastError: unknown;

    for (const model of candidateModels) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are an expert interview evaluator. Always output valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(content);
        } catch {
          let cleaned = content.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          parsed = JSON.parse(cleaned);
        }

        return {
          ...(parsed as unknown as Omit<EvaluateAnswerResult, 'provider' | 'modelUsed' | 'fallbackUsed'>),
          provider: 'openai-compatible',
          modelUsed: model,
          fallbackUsed: true,
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in evaluateAnswer:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate models failed for evaluateAnswer');
  }

  public async polishJd(params: PolishJdParams): Promise<PolishJdResult> {
    const openai = this.getClient();
    const { currentJdText, requestedTone, adjustmentPrompt } = params;

    const prompt = `Adjust and optimize this LinkedIn Job Description according to the instructions.
TARGET TONE: ${requestedTone || 'Professional and engaging'}
SPECIFIC ADJUSTMENT: ${adjustmentPrompt || 'Polish for maximum readability, LinkedIn formatting, and high candidate engagement.'}

CURRENT JD TEXT:
"""
${currentJdText}
"""

Return a JSON with:
{
  "polishedText": "complete refined LinkedIn formatted text"
}`;

    const candidateModels = this.getCandidateModels(this.fastModel);
    let lastError: unknown;

    for (const model of candidateModels) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are an executive copywriter for LinkedIn talent acquisition. Always output JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(content);
        } catch {
          let cleaned = content.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          parsed = JSON.parse(cleaned);
        }

        return {
          polishedText: (parsed.polishedText as string) || '',
          provider: 'openai-compatible',
          modelUsed: model,
          fallbackUsed: true,
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in polishJd:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate models failed for polishJd');
  }

  public async polishJdStream(params: PolishJdStreamParams): Promise<PolishJdResult> {
    const openai = this.getClient();
    const { currentJdText, requestedTone, adjustmentPrompt, onChunk } = params;

    const prompt = `You are an elite LinkedIn talent copywriter.
Adjust and optimize this LinkedIn Job Description according to the instructions.
Output ONLY the raw polished LinkedIn text directly (no conversational preamble, no markdown JSON wrapper, start directly with the hook or job title).

TARGET TONE: ${requestedTone || 'Professional, high-converting and engaging'}
SPECIFIC ADJUSTMENT: ${adjustmentPrompt || 'Polish for maximum readability, LinkedIn formatting, and high candidate engagement.'}

CURRENT JD TEXT:
"""
${currentJdText}
"""`;

    const candidateModels = this.getCandidateModels(this.fastModel);
    let lastError: unknown;

    for (const model of candidateModels) {
      try {
        const stream = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are an executive talent acquisition copywriter. Output only the revised job description.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          stream: true,
        });

        let accumulated = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            accumulated += delta;
            onChunk({ token: delta, done: false });
          }
        }

        onChunk({ token: '', done: true });

        return {
          polishedText: accumulated.trim(),
          provider: 'openai-compatible',
          modelUsed: model,
          fallbackUsed: true,
        };
      } catch (err: unknown) {
        console.warn(`[OpenAiFallbackProvider] Model ${model} failed in polishJdStream:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate models failed for polishJdStream');
  }
}
