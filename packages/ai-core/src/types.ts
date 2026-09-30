import {
  RecruitmentKit,
  JobDescription,
  InterviewGuide,
  AiProviderType,
  GenerationConfig,
  ChatRolePersona,
} from '@recruitcraft/shared';

export interface GenerateKitParams {
  rawNotes: string;
  seniority?: GenerationConfig['seniority'];
  workModel?: GenerationConfig['workModel'];
  tone?: GenerationConfig['tone'];
  useHighThinking?: boolean;
  modelPreference?: string;
}

export interface GenerateKitResult {
  jobDescription: JobDescription;
  interviewGuide: InterviewGuide;
  seniorityCalibrationNotes?: string;
  thinkingProcess?: string;
  generatedAt: string;
  modelUsed: string;
  provider: AiProviderType;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface ChatMessageParam {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface ChatParams {
  messages: ChatMessageParam[];
  rolePersona?: ChatRolePersona;
  roleContext?: {
    jobTitle?: string;
    seniority?: string;
    workModel?: string;
    hardSkills?: string[];
    softSkills?: string[];
    rawNotes?: string;
  };
  modelChoice?: string;
  useHighThinking?: boolean;
}

export interface ChatResult {
  reply: string;
  modelUsed: string;
  provider: AiProviderType;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface EvaluateAnswerParams {
  question: string;
  rubric: {
    strongSignal: string;
    acceptableSignal: string;
    redFlags: string;
  };
  candidateAnswer: string;
  targetSkill?: string;
  roleTitle?: string;
}

export interface EvaluateAnswerResult {
  score: number;
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  strengths: string[];
  concerns: string[];
  recommendedFollowUp: string;
  provider: AiProviderType;
  modelUsed: string;
  fallbackUsed: boolean;
}

export interface PolishJdParams {
  currentJdText: string;
  requestedTone?: string;
  adjustmentPrompt?: string;
}

export interface PolishJdResult {
  polishedText: string;
  provider: AiProviderType;
  modelUsed: string;
  fallbackUsed: boolean;
}

export interface ChatStreamParams extends ChatParams {
  onChunk: (chunk: { token: string; done?: boolean }) => void;
}

export interface PolishJdStreamParams extends PolishJdParams {
  onChunk: (chunk: { token: string; done?: boolean }) => void;
}
