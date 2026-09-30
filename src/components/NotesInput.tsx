import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Sliders,
  Zap,
  Info,
  Layers,
  Building,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react';
import { GenerationConfig } from '../types';
import { SAMPLE_ROLES } from '../data/sampleNotes';

interface NotesInputProps {
  rawNotes: string;
  setRawNotes: (notes: string) => void;
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
  loadingStep: string;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  rawNotes,
  setRawNotes,
  config,
  setConfig,
  onGenerate,
  isLoading,
  loadingStep,
}) => {
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  const wordCount = rawNotes.trim() ? rawNotes.trim().split(/\s+/).length : 0;
  const charCount = rawNotes.length;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Top Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Raw Role Notes Sandbox
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Input
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Brain dump hiring manager notes, slack messages, required tech stack, team culture, compensation, or quirks.
          </p>
        </div>

        {/* Quick Sample Role Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Quick Starters:</span>
          {SAMPLE_ROLES.slice(0, 3).map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRawNotes(sample.rawNotes);
                setConfig((prev) => ({
                  ...prev,
                  seniority: sample.seniority,
                  workModel: sample.workModel,
                  tone: sample.tone,
                }));
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="mt-4 relative">
        <textarea
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder={`Paste or type hiring notes here... For example:
- Title: Staff Distributed Systems Engineer
- Team context: High throughput payments ledger, 99.999% uptime
- Must have: Go or Rust, Kafka, Raft/consensus, distributed transactions
- Nice to have: CockroachDB, AWS active-active
- Soft skills: Mentorship, calm under P0 outage pressure, pragmatic design reviews
- Salary: $210k-$240k + 0.15% equity, 100% remote
- Red flags for this team: Over-engineers simple problems, dogmatic about tech`}
          rows={11}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
          <div className="flex items-center space-x-3">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>{charCount} characters</span>
            {wordCount < 15 && (
              <span className="text-amber-400/80 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Add more details for richer questions
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setRawNotes('')}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear notes
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Seniority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Target Seniority
            </label>
            <select
              value={config.seniority}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  seniority: e.target.value as GenerationConfig['seniority'],
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="Entry/Associate">Entry / Associate (0-2 yrs)</option>
              <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
              <option value="Senior">Senior (5-8 yrs)</option>
              <option value="Staff/Principal">Staff / Principal (8+ yrs)</option>
              <option value="Engineering Manager/Director">Engineering Manager / Director</option>
              <option value="VP/Executive">VP / Executive</option>
            </select>
          </div>

          {/* Work Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              Work Model
            </label>
            <select
              value={config.workModel}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  workModel: e.target.value as GenerationConfig['workModel'],
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="Remote">100% Remote</option>
              <option value="Hybrid">Hybrid (2-3 days office)</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>

          {/* LinkedIn Tone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              LinkedIn Tone
            </label>
            <select
              value={config.tone}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  tone: e.target.value as GenerationConfig['tone'],
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="High-Growth Tech & Inspiring">High-Growth Tech &amp; Inspiring</option>
              <option value="Modern & Direct">Modern &amp; Direct</option>
              <option value="Enterprise & Structured">Enterprise &amp; Structured</option>
              <option value="Early-Stage Startup">Early-Stage Startup &amp; Autonomous</option>
            </select>
          </div>
        </div>

        {/* High Thinking & Model Selection Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-lg transition-colors ${
                config.useHighThinking
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-200">
                  High Thinking Mode
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.1 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-lg mt-0.5">
                Applies extended reasoning to calibrate competency thresholds, detect seniority gaps, and synthesize calibrated STAR rubrics with zero fluff.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            {/* Thinking Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.useHighThinking}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setConfig((prev) => ({
                    ...prev,
                    useHighThinking: checked,
                    modelPreference: checked ? 'gemini-3.1-pro-preview' : prev.modelPreference,
                  }));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
            </label>

            {/* Advanced Model Picker Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className="text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Advanced Model Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Advanced Model Selector Details */}
        {showConfigDetails && (
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-2 text-slate-300 animate-fadeIn">
            <span className="font-semibold text-slate-200">Execution Model Selection:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    modelPreference: 'gemini-3.1-pro-preview',
                    useHighThinking: true,
                  }))
                }
                className={`p-2.5 rounded-lg text-left border transition-all ${
                  config.modelPreference === 'gemini-3.1-pro-preview'
                    ? 'border-purple-500/50 bg-purple-950/20 text-purple-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> gemini-3.1-pro-preview
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  High thinking mode for complex role deconstruction
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    modelPreference: 'gemini-3.5-flash',
                    useHighThinking: false,
                  }))
                }
                className={`p-2.5 rounded-lg text-left border transition-all ${
                  config.modelPreference === 'gemini-3.5-flash' && !config.useHighThinking
                    ? 'border-blue-500/50 bg-blue-950/20 text-blue-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> gemini-3.5-flash
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  General tasks, fast and balanced output
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    modelPreference: 'gemini-3.1-flash-lite',
                    useHighThinking: false,
                  }))
                }
                className={`p-2.5 rounded-lg text-left border transition-all ${
                  config.modelPreference === 'gemini-3.1-flash-lite' && !config.useHighThinking
                    ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-200'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> gemini-3.1-flash-lite
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Fastest generation speed
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Generate Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isLoading || !rawNotes.trim()}
            onClick={onGenerate}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
              isLoading || !rawNotes.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-blue-500/25 hover:shadow-cyan-500/20 hover:scale-[1.008] active:scale-[0.995]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingStep || 'Deconstructing notes & crafting recruitment kit...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Generate LinkedIn JD &amp; 10-Question Behavioral Guide</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
