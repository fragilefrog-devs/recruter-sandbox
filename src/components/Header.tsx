import React, { useEffect, useState } from 'react';
import { Briefcase, Sparkles, MessageSquare, Printer, Award, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { RecruitmentKit, AiProviderStatus } from '../types';

interface HeaderProps {
  currentKit: RecruitmentKit | null;
  onReset: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  onOpenScorecard: () => void;
  onPrint: () => void;
  onSelectSampleRole: (index: number) => void;
  sampleRoles: Array<{ title: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  currentKit,
  onReset,
  onOpenChat,
  isChatOpen,
  onOpenScorecard,
  onPrint,
  onSelectSampleRole,
  sampleRoles,
}) => {
  const [providerStatus, setProviderStatus] = useState<AiProviderStatus | null>(null);

  useEffect(() => {
    fetch('/api/ai-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProviderStatus(data);
      })
      .catch((err) => console.warn('Could not fetch AI status', err));
  }, [currentKit]);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                RecruitCraft
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sandbox
              </span>
              {/* Provider Badge */}
              {providerStatus && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border hidden lg:inline-flex items-center gap-1 ${
                    currentKit?.fallbackEngaged || providerStatus.activeProvider === 'openai-compatible'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                  title={
                    providerStatus.fallbackConfigured
                      ? `Primary: Google GenAI | Fallback: OpenAI Compatible (${providerStatus.openaiModel})`
                      : 'Google GenAI Active'
                  }
                >
                  <Zap className="w-3 h-3" />
                  {currentKit?.fallbackEngaged
                    ? 'OpenAI Fallback Active'
                    : providerStatus.fallbackConfigured
                    ? 'Gemini + OpenAI Resilient'
                    : 'Google Gemini SDK'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Raw Notes &rarr; LinkedIn Job Description &amp; 10-Question Behavioral Guide
            </p>
          </div>
        </div>

        {/* Current Role status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sample roles picker */}
          <div className="relative group">
            <select
              aria-label="Load a sample role notes"
              className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer appearance-none pr-7"
              onChange={(e) => {
                const val = e.target.value;
                if (val !== '') {
                  onSelectSampleRole(parseInt(val, 10));
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                💡 Load Sample Role...
              </option>
              {sampleRoles.map((role, idx) => (
                <option key={idx} value={idx}>
                  {role.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {currentKit && (
            <>
              <button
                onClick={onOpenScorecard}
                className="hidden md:flex items-center space-x-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors"
                title="View Candidate Debrief & Scorecard"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Scorecard</span>
              </button>

              <button
                onClick={onPrint}
                className="hidden sm:flex items-center space-x-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Kit</span>
              </button>
            </>
          )}

          {/* AI Copilot chat trigger */}
          <button
            onClick={onOpenChat}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1.5 px-3 rounded-lg transition-all shadow-sm ${
              isChatOpen
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-cyan-500/25 ring-2 ring-cyan-400'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Recruiting Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {currentKit && (
            <button
              onClick={onReset}
              className="text-xs p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Start New Role"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
