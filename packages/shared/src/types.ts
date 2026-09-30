/**
 * Shared Domain Types for RecruitCraft Recruitment Sandbox & Interview Lab
 */

export interface CandidateQuestionScore {
  rating: number; // 1 to 5
  notes: string;
  candidateAnswerDraft?: string;
  aiEvaluation?: {
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
  };
}

export interface BehavioralQuestion {
  id: number;
  question: string;
  category: 'hard_skill' | 'soft_skill';
  targetSkill: string;
  intent: string;
  followUpProbes: string[];
  rubric: {
    strongSignal: string;
    acceptableSignal: string;
    redFlags: string;
  };
}

export interface JobDescription {
  jobTitle: string;
  department: string;
  seniority: string;
  employmentType: string;
  location: string;
  compensation: string;
  hook: string;
  aboutCompany: string;
  roleOverview: string;
  responsibilities: string[];
  hardSkills: string[];
  softSkills: string[];
  niceToHaves: string[];
  benefits: string[];
  callToAction: string;
  linkedinFormattedText: string;
  skillsSummary: {
    hardSkills: string[];
    softSkills: string[];
    toolsAndTech: string[];
  };
}

export interface InterviewGuide {
  roleTitle: string;
  summary: string;
  estimatedDurationMinutes: number;
  targetCompetenciesOverview: Array<{
    name: string;
    type: 'hard_skill' | 'soft_skill';
    description: string;
  }>;
  questions: BehavioralQuestion[];
}

export type AiProviderType = 'google' | 'openai-compatible';

export interface RecruitmentKit {
  jobDescription: JobDescription;
  interviewGuide: InterviewGuide;
  thinkingProcess?: string;
  seniorityCalibrationNotes?: string;
  generatedAt: string;
  modelUsed: string;
  providerUsed?: AiProviderType;
  fallbackEngaged?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  model?: string;
  isThinking?: boolean;
  isStreaming?: boolean;
  provider?: AiProviderType;
}

export type ChatRolePersona = 'talent_architect' | 'interviewer_coach' | 'executive_sourcer';

export interface GenerationConfig {
  seniority: 'Entry/Associate' | 'Mid-Level' | 'Senior' | 'Staff/Principal' | 'Engineering Manager/Director' | 'VP/Executive';
  workModel: 'Remote' | 'Hybrid' | 'On-Site';
  tone: 'High-Growth Tech & Inspiring' | 'Modern & Direct' | 'Enterprise & Structured' | 'Early-Stage Startup';
  useHighThinking: boolean;
  modelPreference: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
}

export interface AiProviderStatus {
  primaryProvider: 'google';
  primaryConfigured: boolean;
  fallbackProvider: 'openai-compatible';
  fallbackConfigured: boolean;
  activeProvider: AiProviderType;
  openaiBaseUrl?: string;
  openaiModel?: string;
}
