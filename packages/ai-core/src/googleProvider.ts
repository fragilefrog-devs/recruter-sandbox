import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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
} from './types.js';

export class GoogleGenAiProvider {
  private ai: GoogleGenAI | null = null;
  private apiKey: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.ai = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      this.apiKey = process.env.GEMINI_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in environment.');
      }
      this.ai = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  public async generateKit(params: GenerateKitParams): Promise<GenerateKitResult> {
    const ai = this.getClient();
    const {
      rawNotes,
      seniority = 'Senior',
      workModel = 'Hybrid',
      tone = 'High-Growth Tech & Inspiring',
      useHighThinking = false,
      modelPreference = 'gemini-3.5-flash',
    } = params;

    let selectedModel = modelPreference;
    let thinkingConfig: { thinkingLevel: ThinkingLevel } | undefined = undefined;

    if (useHighThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const systemInstruction = `You are a Principal Talent Acquisition Architect and Executive Technical Recruiter.
Your objective is to deconstruct raw notes about a desired role and produce two production-grade artifacts:
1. A polished, high-converting Job Description strictly formatted for LinkedIn (captivating hook, crisp impact-driven bullets, clean separation of technical/hard vs soft skills, transparent expectations, and LinkedIn-ready formatting with professional spacing and emojis).
2. An Interview Guide containing EXACTLY 10 behavioral questions specifically targeting the soft and hard skills articulated in the new Job Description.

For the 10 behavioral questions:
- Exactly 10 questions.
- Distribute balanced coverage between Hard Skills (technical problem-solving, architectural decision-making, debugging, tools, execution methodologies) and Soft Skills (cross-functional communication, conflict resolution, dealing with ambiguity, leadership, ownership, empathy).
- Every question MUST follow the behavioral STAR framework ("Tell me about a time when...", "Walk me through a situation where...").
- For EACH question, specify:
  * targetSkill (the exact hard or soft skill from the JD)
  * category ('hard_skill' or 'soft_skill')
  * intent (what signal the interviewer is testing for)
  * followUpProbes (2-3 targeted follow-up probing questions to test authenticity and depth)
  * rubric:
    - strongSignal (What great looks like: proactive ownership, quantifiable business/technical impact, clear reasoning, humility)
    - acceptableSignal (Meets basic bar: acceptable execution but passive or lacking nuance)
    - redFlags (Warning signs: deflection, blaming colleagues, superficial answers, unaddressed architectural debt, lack of accountability)

Output must be valid JSON adhering strictly to the schema provided.`;

    const userPrompt = `Role Calibration Parameters:
- Target Seniority: ${seniority}
- Work Model: ${workModel}
- LinkedIn Tone: ${tone}

Raw Notes from Hiring Manager / Team:
"""
${rawNotes.trim()}
"""

Generate the complete JSON response with both the LinkedIn Job Description and the 10-Question Behavioral Interview Guide.
Ensure the JSON has this exact structure:
{
  "jobDescription": {
    "jobTitle": "string",
    "department": "string",
    "seniority": "string",
    "employmentType": "Full-time | Contract | Part-time",
    "location": "string",
    "compensation": "string",
    "hook": "string (engaging 1-2 sentence hook designed for LinkedIn feed visibility)",
    "aboutCompany": "string (mission & team context)",
    "roleOverview": "string (why this role matters & key charter)",
    "responsibilities": ["string", "string", ...],
    "hardSkills": ["string", "string", ...],
    "softSkills": ["string", "string", ...],
    "niceToHaves": ["string", "string", ...],
    "benefits": ["string", "string", ...],
    "callToAction": "string (application instructions & EOE note)",
    "linkedinFormattedText": "string (complete ready-to-paste text formatted with emojis, clean sections, bullet points, and relevant hashtags)",
    "skillsSummary": {
      "hardSkills": ["string", ...],
      "softSkills": ["string", ...],
      "toolsAndTech": ["string", ...]
    }
  },
  "interviewGuide": {
    "roleTitle": "string",
    "summary": "string (brief overview of how to conduct this interview loop)",
    "estimatedDurationMinutes": 60,
    "targetCompetenciesOverview": [
      { "name": "string", "type": "hard_skill | soft_skill", "description": "string" }
    ],
    "questions": [
      {
        "id": 1,
        "question": "string (STAR-formatted behavioral question)",
        "category": "hard_skill | soft_skill",
        "targetSkill": "string (must match a skill from the JD)",
        "intent": "string (why we ask this)",
        "followUpProbes": ["probe 1", "probe 2", "probe 3"],
        "rubric": {
          "strongSignal": "string",
          "acceptableSignal": "string",
          "redFlags": "string"
        }
      }
    ]
  },
  "seniorityCalibrationNotes": "string (strategic advice on candidate pool, leveling nuances, or market compensation)",
  "thinkingProcess": "string (summary of talent architecture choices made)"
}`;

    const config: Record<string, unknown> = {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
    };

    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config,
    });

    const responseText = response.text || '';
    if (!responseText) {
      throw new Error('Empty response received from Google Gemini.');
    }

    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(cleanedJson);

    if (parsedData.interviewGuide && Array.isArray(parsedData.interviewGuide.questions)) {
      parsedData.interviewGuide.questions = parsedData.interviewGuide.questions.map(
        (q: Record<string, unknown>, index: number) => ({
          ...q,
          id: index + 1,
        })
      );
    }

    return {
      ...parsedData,
      generatedAt: new Date().toISOString(),
      modelUsed: selectedModel,
      provider: 'google',
      fallbackUsed: false,
    };
  }

  public async chat(params: ChatParams): Promise<ChatResult> {
    const ai = this.getClient();
    const {
      messages,
      rolePersona = 'talent_architect',
      roleContext,
      modelChoice = 'gemini-3.5-flash',
      useHighThinking = false,
    } = params;

    let selectedModel = modelChoice;
    let thinkingConfig: { thinkingLevel: ThinkingLevel } | undefined = undefined;

    if (useHighThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    let personaInstruction = '';
    if (rolePersona === 'interviewer_coach') {
      personaInstruction = `You are an Interview Calibration Coach and Behavioral Assessment Expert.
Your purpose is to coach hiring managers and interviewers:
- Help calibrate candidate responses against the 10 behavioral interview questions and STAR rubrics.
- Provide real-time evaluation of candidate answers (grading Situation, Task, Action, Result).
- Suggest surgical follow-up probes to test for authenticity, depth, and red flags.
- Coach interviewers on removing unconscious bias while maintaining an uncompromising technical & culture bar.`;
    } else if (rolePersona === 'executive_sourcer') {
      personaInstruction = `You are an Elite Executive Talent Sourcer and Headhunter.
Your specialty is outbound talent engagement:
- Crafting hyper-personalized LinkedIn InMail and email outreach messages that achieve 40%+ response rates.
- Generating exact Boolean search strings (for LinkedIn Recruiter, GitHub, Google X-Ray) tailored to the role's hard skills.
- Identifying competitor talent pools, target company tiers, and passive candidate motivators.`;
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

    const systemInstruction = `${personaInstruction}

${contextPrefix}
Always provide crisp, insightful, actionable responses with bullet points, strategic advice, or formatted copy when appropriate.`;

    const config: Record<string, unknown> = {
      systemInstruction,
      temperature: 0.7,
    };

    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    const contents = messages.map((m) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const replyText = response.text || '';

    return {
      reply: replyText,
      modelUsed: selectedModel,
      provider: 'google',
      fallbackUsed: false,
    };
  }

  public async chatStream(params: ChatStreamParams): Promise<ChatResult> {
    const ai = this.getClient();
    const {
      messages,
      rolePersona = 'talent_architect',
      roleContext,
      modelChoice = 'gemini-3.5-flash',
      useHighThinking = false,
      onChunk,
    } = params;

    let selectedModel = modelChoice;
    let thinkingConfig: { thinkingLevel: ThinkingLevel } | undefined = undefined;

    if (useHighThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    let personaInstruction = '';
    if (rolePersona === 'interviewer_coach') {
      personaInstruction = `You are an Interview Calibration Coach and Behavioral Assessment Expert.
Your purpose is to coach hiring managers and interviewers:
- Help calibrate candidate responses against the 10 behavioral interview questions and STAR rubrics.
- Provide real-time evaluation of candidate answers (grading Situation, Task, Action, Result).
- Suggest surgical follow-up probes to test for authenticity, depth, and red flags.
- Coach interviewers on removing unconscious bias while maintaining an uncompromising technical & culture bar.`;
    } else if (rolePersona === 'executive_sourcer') {
      personaInstruction = `You are an Elite Executive Talent Sourcer and Headhunter.
Your specialty is outbound talent engagement:
- Crafting hyper-personalized LinkedIn InMail and email outreach messages that achieve 40%+ response rates.
- Generating exact Boolean search strings (for LinkedIn Recruiter, GitHub, Google X-Ray) tailored to the role's hard skills.
- Identifying competitor talent pools, target company tiers, and passive candidate motivators.`;
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

    const systemInstruction = `${personaInstruction}\n\n${contextPrefix}\nAlways provide crisp, insightful, actionable responses formatted in Markdown with headings, bullet points, strategic advice, or formatted copy when appropriate.`;

    const config: Record<string, unknown> = {
      systemInstruction,
      temperature: 0.7,
    };

    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    const contents = messages.map((m) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config,
    });

    let accumulated = '';
    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        accumulated += text;
        onChunk({ token: text, done: false });
      }
    }

    onChunk({ token: '', done: true });

    return {
      reply: accumulated,
      modelUsed: selectedModel,
      provider: 'google',
      fallbackUsed: false,
    };
  }

  public async evaluateAnswer(params: EvaluateAnswerParams): Promise<EvaluateAnswerResult> {
    const ai = this.getClient();
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

    const modelUsed = 'gemini-3.5-flash';
    const response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let cleaned = (response.text || '{}').trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const evaluation = JSON.parse(cleaned);

    return {
      ...evaluation,
      provider: 'google',
      modelUsed,
      fallbackUsed: false,
    };
  }

  public async polishJd(params: PolishJdParams): Promise<PolishJdResult> {
    const ai = this.getClient();
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

    const modelUsed = 'gemini-3.1-flash-lite';
    const response = await ai.models.generateContent({
      model: modelUsed,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let cleaned = (response.text || '{}').trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    const result = JSON.parse(cleaned);

    return {
      polishedText: result.polishedText || '',
      provider: 'google',
      modelUsed,
      fallbackUsed: false,
    };
  }
}
