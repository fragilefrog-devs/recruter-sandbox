import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  BrainCircuit,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  Sliders,
  ChevronRight,
  Shield,
  MessageSquare,
  Square
} from 'lucide-react';
import { ChatMessage, ChatRolePersona, RecruitmentKit } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface RecruitmentChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentKit: RecruitmentKit | null;
  rawNotes: string;
}

export const RecruitmentChatbot: React.FC<RecruitmentChatbotProps> = ({
  isOpen,
  onClose,
  currentKit,
  rawNotes,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Hello! I am your **Recruitment Copilot**. I can help you refine your LinkedIn Job Description, formulate Boolean search strings, benchmark compensation, or simulate candidate responses against your behavioral interview questions.\n\n*How can I assist your recruiting pipeline today?*',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.6-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<ChatRolePersona>('talent_architect');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [modelChoice, setModelChoice] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto scroll to bottom of thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Context-aware prompt suggestions
  const promptSuggestions = [
    'Write 3 personalized LinkedIn InMail messages for passive candidates',
    'Generate a Boolean search string for finding candidates on LinkedIn Recruiter',
    'What are the subtle red flags to watch for when evaluating answers to these 10 questions?',
    'How should we adjust the compensation and leveling between Senior and Staff for this role?',
  ];

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    const assistantMsgId = `model-${Date.now()}`;
    const effectiveModel = useHighThinking ? 'gemini-3.1-pro-preview' : modelChoice;

    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: effectiveModel,
      isThinking: useHighThinking,
      isStreaming: true,
    };

    setMessages([...newMessages, assistantPlaceholder]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Role context payload
      const roleContext = currentKit
        ? {
            jobTitle: currentKit.jobDescription.jobTitle,
            seniority: currentKit.jobDescription.seniority,
            workModel: currentKit.jobDescription.location,
            hardSkills: currentKit.jobDescription.hardSkills,
            softSkills: currentKit.jobDescription.softSkills,
            rawNotes,
          }
        : { rawNotes };

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          rolePersona: persona,
          roleContext,
          modelChoice: effectiveModel,
          useHighThinking,
        }),
      });

      if (!response.ok || !response.body) {
        // Fallback to standard chat endpoint if streaming route is unavailable
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            rolePersona: persona,
            roleContext,
            modelChoice: effectiveModel,
            useHighThinking,
          }),
        });

        if (!fallbackRes.ok) {
          throw new Error('Failed to get response from copilot');
        }

        const data = await fallbackRes.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.reply,
                  model: data.modelUsed || effectiveModel,
                  isStreaming: false,
                }
              : m
          )
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let finalModel = effectiveModel;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.token) {
              accumulatedText += parsed.token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: accumulatedText,
                        isStreaming: true,
                      }
                    : m
                )
              );
            }

            if (parsed.reply && !accumulatedText) {
              accumulatedText = parsed.reply;
            }

            if (parsed.modelUsed) {
              finalModel = parsed.modelUsed;
            }

            if (parsed.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: accumulatedText,
                        model: finalModel,
                        isStreaming: false,
                      }
                    : m
                )
              );
            }
          } catch {
            // Ignore partial SSE parsing issues
          }
        }
      }

      // Ensure final state is cleaned up
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: accumulatedText || m.content,
                model: finalModel,
                isStreaming: false,
              }
            : m
        )
      );
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        return;
      }
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `⚠️ **Generation Error**: ${errorMessage}\n\nPlease try again or switch to a different model.`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content:
          'Chat history reset. How can I assist you with your recruitment strategy, LinkedIn outreach, or interview questions?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.6-flash',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Recruitment Copilot</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Streaming &amp; Markdown
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dual-Engine AI &bull; Role &amp; JD Calibrated
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persona & Model Configuration Bar */}
      <div className="p-3 bg-slate-950/50 border-b border-slate-800 space-y-2 text-xs">
        {/* Role Persona Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-medium text-[11px]">Role:</span>
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-[11px] w-full">
            <button
              onClick={() => setPersona('talent_architect')}
              className={`flex-1 py-1 px-1.5 rounded-md font-medium text-center transition-all truncate ${
                persona === 'talent_architect'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TA Architect
            </button>
            <button
              onClick={() => setPersona('interviewer_coach')}
              className={`flex-1 py-1 px-1.5 rounded-md font-medium text-center transition-all truncate ${
                persona === 'interviewer_coach'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interview Coach
            </button>
            <button
              onClick={() => setPersona('executive_sourcer')}
              className={`flex-1 py-1 px-1.5 rounded-md font-medium text-center transition-all truncate ${
                persona === 'executive_sourcer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sourcer / InMail
            </button>
          </div>
        </div>

        {/* High Thinking Mode & Model selection */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useHighThinking}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseHighThinking(checked);
                  if (checked) {
                    setModelChoice('gemini-3.1-pro-preview');
                  }
                }}
                className="w-3.5 h-3.5 accent-purple-500 rounded"
              />
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                useHighThinking ? 'text-purple-300' : 'text-slate-400'
              }`}>
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> High Thinking Mode
              </span>
            </label>
            {useHighThinking && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Reasoning Enabled
              </span>
            )}
          </div>

          {!useHighThinking && (
            <select
              aria-label="Select AI Model"
              value={modelChoice}
              onChange={(e) =>
                setModelChoice(
                  e.target.value as 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'
                )
              }
              className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none"
            >
              <option value="gemini-3.5-flash">gemini-3.6-flash (Fast &amp; Accurate)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro (Complex)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.5-flash-lite (Ultra-Fast)</option>
            </select>
          )}
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="group relative max-w-[88%] min-w-0">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : msg.content ? (
                    <MarkdownRenderer content={msg.content} isStreaming={msg.isStreaming} />
                  ) : (
                    <div className="flex items-center space-x-2 py-1 text-slate-400 text-xs">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[11px] text-cyan-300">Formulating response...</span>
                    </div>
                  )}
                </div>

                {/* Footer metadata: time, model, copy */}
                <div
                  className={`flex items-center space-x-1.5 mt-1 text-[10px] text-slate-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.model && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-400 truncate max-w-[120px]">{msg.model}</span>
                    </>
                  )}
                  {msg.isThinking && (
                    <>
                      <span>&bull;</span>
                      <span className="text-purple-400 flex items-center gap-0.5 font-semibold">
                        <BrainCircuit className="w-2.5 h-2.5" /> High Thinking
                      </span>
                    </>
                  )}
                  {msg.isStreaming && (
                    <>
                      <span>&bull;</span>
                      <span className="text-cyan-400 flex items-center gap-1 font-semibold animate-pulse">
                        Streaming
                      </span>
                    </>
                  )}
                  {!isUser && msg.content && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-200 ml-1 transition-opacity"
                      title="Copy response"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Context-aware suggestions */}
      {messages.length <= 3 && !isLoading && (
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] text-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
              >
                &rarr; {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box & Stop generation control */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'Copilot is generating streamed response...'
                : useHighThinking
                ? 'Ask a complex recruiting or interview question (High Thinking)...'
                : 'Ask recruiting copilot (e.g. InMail, leveling, rubric tweak)...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-sans disabled:opacity-60"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md flex items-center justify-center"
              title="Stop streaming response"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
