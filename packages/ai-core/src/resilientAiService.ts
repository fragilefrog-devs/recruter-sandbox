import { GoogleGenAiProvider } from './googleProvider.js';
import { OpenAiFallbackProvider } from './openaiFallbackProvider.js';
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
import { AiProviderStatus, AiProviderType } from '@recruitcraft/shared';

export class ResilientAiService {
  private googleProvider: GoogleGenAiProvider;
  private openaiProvider: OpenAiFallbackProvider;
  private googleQuotaExhausted: boolean = false;

  constructor() {
    this.googleProvider = new GoogleGenAiProvider();
    this.openaiProvider = new OpenAiFallbackProvider();
  }

  private isQuotaExhaustedError(errMessage: string): boolean {
    const lower = errMessage.toLowerCase();
    return (
      lower.includes('resource_exhausted') ||
      lower.includes('quota') ||
      lower.includes('rate limit') ||
      lower.includes('429')
    );
  }

  public getProviderStatus(): AiProviderStatus {
    const googleAvail = this.googleProvider.isAvailable() && !this.googleQuotaExhausted;
    const openaiAvail = this.openaiProvider.isAvailable();
    const preferred = process.env.AI_PROVIDER?.toLowerCase();

    let active: AiProviderType = 'google';
    if (preferred === 'openai' && openaiAvail) {
      active = 'openai-compatible';
    } else if (this.googleQuotaExhausted && openaiAvail) {
      active = 'openai-compatible';
    } else if (!googleAvail && openaiAvail) {
      active = 'openai-compatible';
    }

    return {
      primaryProvider: 'google',
      primaryConfigured: this.googleProvider.isAvailable(),
      fallbackProvider: 'openai-compatible',
      fallbackConfigured: openaiAvail,
      activeProvider: active,
      openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://9router-production-a99a.up.railway.app/v1',
      openaiModel: process.env.OPENAI_MODEL || 'gemini/gemini-3.6-flash',
    };
  }

  public async generateKit(params: GenerateKitParams): Promise<GenerateKitResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.generateKit(
        params,
        this.googleQuotaExhausted
          ? 'Google GenAI quota exhausted. Executed via OpenAI-compatible endpoint'
          : 'Configured as primary via AI_PROVIDER=openai'
      );
    }

    // Try Google first
    try {
      if (!this.googleProvider.isAvailable()) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return await this.googleProvider.generateKit(params);
    } catch (googleError: unknown) {
      const errMessage = googleError instanceof Error ? googleError.message : String(googleError);
      console.warn(
        `[ResilientAiService] Google GenAI provider error: "${errMessage}". Checking for OpenAI-compatible fallback...`
      );

      if (this.isQuotaExhaustedError(errMessage)) {
        this.googleQuotaExhausted = true;
      }

      // Attempt OpenAI fallback
      if (this.openaiProvider.isAvailable()) {
        console.info('[ResilientAiService] Engaging OpenAI-compatible fallback provider.');
        return await this.openaiProvider.generateKit(
          params,
          `Google GenAI fallback triggered: ${errMessage}`
        );
      }

      // If OpenAI fallback not configured, throw original error with helpful hint
      throw new Error(
        `Google GenAI error: ${errMessage}. (OpenAI fallback unavailable: OPENAI_API_KEY is not configured in .env)`
      );
    }
  }

  public async chat(params: ChatParams): Promise<ChatResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.chat(
        params,
        this.googleQuotaExhausted
          ? 'Google quota exhausted. Executed via OpenAI-compatible endpoint'
          : 'Configured as primary via AI_PROVIDER=openai'
      );
    }

    try {
      if (!this.googleProvider.isAvailable()) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return await this.googleProvider.chat(params);
    } catch (googleError: unknown) {
      const errMessage = googleError instanceof Error ? googleError.message : String(googleError);
      console.warn(
        `[ResilientAiService] Google GenAI chat error: "${errMessage}". Checking for OpenAI fallback...`
      );

      if (this.isQuotaExhaustedError(errMessage)) {
        this.googleQuotaExhausted = true;
      }

      if (this.openaiProvider.isAvailable()) {
        console.info('[ResilientAiService] Engaging OpenAI fallback for chat.');
        return await this.openaiProvider.chat(
          params,
          `Google GenAI fallback triggered: ${errMessage}`
        );
      }

      throw new Error(
        `Google GenAI error: ${errMessage}. (OpenAI fallback unavailable: OPENAI_API_KEY not configured)`
      );
    }
  }

  public async chatStream(params: ChatStreamParams): Promise<ChatResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.chatStream(
        params,
        this.googleQuotaExhausted
          ? 'Google quota exhausted, streaming via OpenAI-compatible endpoint'
          : undefined
      );
    }

    try {
      if (!this.googleProvider.isAvailable()) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return await this.googleProvider.chatStream(params);
    } catch (googleError: unknown) {
      const errMessage = googleError instanceof Error ? googleError.message : String(googleError);
      console.warn(
        `[ResilientAiService] Google GenAI chatStream error: "${errMessage}". Attempting OpenAI streaming fallback...`
      );

      if (this.isQuotaExhaustedError(errMessage)) {
        this.googleQuotaExhausted = true;
      }

      if (this.openaiProvider.isAvailable()) {
        return await this.openaiProvider.chatStream(
          params,
          `Google fallback triggered: ${errMessage}`
        );
      }

      throw new Error(`Chat stream failed: ${errMessage}`);
    }
  }

  public async evaluateAnswer(params: EvaluateAnswerParams): Promise<EvaluateAnswerResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.evaluateAnswer(params);
    }

    try {
      if (!this.googleProvider.isAvailable()) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return await this.googleProvider.evaluateAnswer(params);
    } catch (googleError: unknown) {
      const errMessage = googleError instanceof Error ? googleError.message : String(googleError);
      console.warn(`[ResilientAiService] Google evaluation error: "${errMessage}". Attempting fallback...`);

      if (this.isQuotaExhaustedError(errMessage)) {
        this.googleQuotaExhausted = true;
      }

      if (this.openaiProvider.isAvailable()) {
        return await this.openaiProvider.evaluateAnswer(params);
      }

      throw new Error(`Evaluation failed: ${errMessage}`);
    }
  }

  public async polishJd(params: PolishJdParams): Promise<PolishJdResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.polishJd(params);
    }

    try {
      if (!this.googleProvider.isAvailable()) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return await this.googleProvider.polishJd(params);
    } catch (googleError: unknown) {
      const errMessage = googleError instanceof Error ? googleError.message : String(googleError);
      console.warn(`[ResilientAiService] Google polish error: "${errMessage}". Attempting fallback...`);

      if (this.isQuotaExhaustedError(errMessage)) {
        this.googleQuotaExhausted = true;
      }

      if (this.openaiProvider.isAvailable()) {
        return await this.openaiProvider.polishJd(params);
      }

      throw new Error(`Polish failed: ${errMessage}`);
    }
  }

  public async polishJdStream(params: PolishJdStreamParams): Promise<PolishJdResult> {
    const preferOpenAi =
      process.env.AI_PROVIDER?.toLowerCase() === 'openai' || this.googleQuotaExhausted;

    if (preferOpenAi && this.openaiProvider.isAvailable()) {
      return this.openaiProvider.polishJdStream(params);
    }

    if (this.openaiProvider.isAvailable()) {
      return await this.openaiProvider.polishJdStream(params);
    }

    const res = await this.polishJd({
      currentJdText: params.currentJdText,
      requestedTone: params.requestedTone,
      adjustmentPrompt: params.adjustmentPrompt,
    });
    params.onChunk({ token: res.polishedText, done: true });
    return res;
  }
}

export const resilientAiService = new ResilientAiService();
