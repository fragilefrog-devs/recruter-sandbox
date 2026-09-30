import { Router, Request, Response } from 'express';
import { resilientAiService } from '@recruitcraft/ai-core';

export const apiRouter = Router();

/**
 * Health check & AI Provider status
 */
apiRouter.get('/ai-status', (_req: Request, res: Response): void => {
  const status = resilientAiService.getProviderStatus();
  res.json(status);
});

/**
 * Generate Recruitment Kit (LinkedIn JD + 10-Question Behavioral Guide)
 */
apiRouter.post('/generate-recruitment-kit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawNotes, seniority, workModel, tone, useHighThinking, modelPreference } = req.body;

    if (!rawNotes || typeof rawNotes !== 'string' || !rawNotes.trim()) {
      res.status(400).json({ error: 'Please provide raw notes about the role.' });
      return;
    }

    const result = await resilientAiService.generateKit({
      rawNotes,
      seniority,
      workModel,
      tone,
      useHighThinking,
      modelPreference,
    });

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/generate-recruitment-kit:', error);
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    res.status(500).json({ error: `Failed to generate recruitment kit: ${message}` });
  }
});

/**
 * Multi-turn Recruiter Copilot Chat
 */
apiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, rolePersona, roleContext, modelChoice, useHighThinking } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const result = await resilientAiService.chat({
      messages,
      rolePersona,
      roleContext,
      modelChoice,
      useHighThinking,
    });

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown chat error';
    res.status(500).json({ error: `Chat generation failed: ${message}` });
  }
});

/**
 * Real-time Multi-turn Recruiter Copilot SSE Stream
 */
apiRouter.post('/chat/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, rolePersona, roleContext, modelChoice, useHighThinking } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const result = await resilientAiService.chatStream({
      messages,
      rolePersona,
      roleContext,
      modelChoice,
      useHighThinking,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      },
    });

    res.write(
      `data: ${JSON.stringify({
        done: true,
        reply: result.reply,
        modelUsed: result.modelUsed,
        provider: result.provider,
        fallbackUsed: result.fallbackUsed,
      })}\n\n`
    );
    res.end();
  } catch (error: unknown) {
    console.error('Error in /api/chat/stream:', error);
    const message = error instanceof Error ? error.message : 'Unknown chat streaming error';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
      res.end();
    }
  }
});

/**
 * Evaluate Candidate Answer against Rubric (AI Bar Raiser)
 */
apiRouter.post('/evaluate-candidate-answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, rubric, candidateAnswer, targetSkill, roleTitle } = req.body;

    if (!question || !candidateAnswer) {
      res.status(400).json({ error: 'Question and candidate answer are required.' });
      return;
    }

    const result = await resilientAiService.evaluateAnswer({
      question,
      rubric,
      candidateAnswer,
      targetSkill,
      roleTitle,
    });

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/evaluate-candidate-answer:', error);
    const message = error instanceof Error ? error.message : 'Evaluation error';
    res.status(500).json({ error: message });
  }
});

/**
 * Polish / Tone Shift LinkedIn JD
 */
apiRouter.post('/polish-jd', async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentJdText, requestedTone, adjustmentPrompt } = req.body;

    if (!currentJdText) {
      res.status(400).json({ error: 'currentJdText is required.' });
      return;
    }

    const result = await resilientAiService.polishJd({
      currentJdText,
      requestedTone,
      adjustmentPrompt,
    });

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/polish-jd:', error);
    res.status(500).json({ error: 'Failed to polish JD' });
  }
});

/**
 * Real-time Polish JD SSE Stream
 */
apiRouter.post('/polish-jd/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentJdText, requestedTone, adjustmentPrompt } = req.body;

    if (!currentJdText) {
      res.status(400).json({ error: 'currentJdText is required.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const result = await resilientAiService.polishJdStream({
      currentJdText,
      requestedTone,
      adjustmentPrompt,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      },
    });

    res.write(
      `data: ${JSON.stringify({
        done: true,
        polishedText: result.polishedText,
        modelUsed: result.modelUsed,
        provider: result.provider,
        fallbackUsed: result.fallbackUsed,
      })}\n\n`
    );
    res.end();
  } catch (error: unknown) {
    console.error('Error in /api/polish-jd/stream:', error);
    const message = error instanceof Error ? error.message : 'Unknown polish streaming error';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
      res.end();
    }
  }
});
