import React, { useState } from 'react';
import {
  Copy,
  Check,
  Linkedin,
  FileText,
  DollarSign,
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
  Wand2,
  Share2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobDescription } from '../types';

interface JobDescriptionViewProps {
  jobDescription: JobDescription;
  onPolishJd?: (instruction: string) => Promise<void>;
  isPolishing?: boolean;
}

export const JobDescriptionView: React.FC<JobDescriptionViewProps> = ({
  jobDescription,
  onPolishJd,
  isPolishing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'formatted' | 'competencies'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const charLength = jobDescription.linkedinFormattedText?.length || 0;
  // LinkedIn post sweet spot is typically 1,200 - 2,500 characters
  const isLinkedInOptimal = charLength >= 800 && charLength <= 3000;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {jobDescription.jobTitle || 'LinkedIn Job Description'}
              </h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                LinkedIn Tailored
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {jobDescription.department} &bull; {jobDescription.seniority} &bull; {jobDescription.location}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Quick Copy */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rich Preview
            </button>
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeTab === 'formatted'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>LinkedIn Paste</span>
            </button>
            <button
              onClick={() => setActiveTab('competencies')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'competencies'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Skills Breakdown
            </button>
          </div>

          <button
            onClick={() => handleCopy(jobDescription.linkedinFormattedText)}
            className={`text-xs py-1.5 px-3 rounded-xl font-medium border flex items-center space-x-1.5 transition-all shadow-sm ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Polish Action Bar */}
      {onPolishJd && (
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Quick Polish:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              disabled={isPolishing}
              onClick={() => onPolishJd('Make the hook punchier and emphasize high equity & salary upside')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-500/30 transition-colors disabled:opacity-50"
            >
              ⚡ Boost Hook &amp; Comp
            </button>
            <button
              disabled={isPolishing}
              onClick={() => onPolishJd('Condense into a crisp high-impact 1,500-character mobile LinkedIn post')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-500/30 transition-colors disabled:opacity-50"
            >
              📱 Mobile Friendly
            </button>
            <button
              disabled={isPolishing}
              onClick={() => onPolishJd('Sharpen technical rigor and add specific architectural challenges')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-500/30 transition-colors disabled:opacity-50"
            >
              🛠️ More Tech Rigor
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="p-5 overflow-y-auto max-h-[640px] space-y-6 text-sm">
        {/* TAB 1: RICH PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* LinkedIn Feed Hook Card */}
            {jobDescription.hook && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-500/30 shadow-inner">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> High-Converting LinkedIn Hook
                </span>
                <p className="text-slate-100 font-medium leading-relaxed italic text-sm sm:text-base">
                  &ldquo;{jobDescription.hook}&rdquo;
                </p>
              </div>
            )}

            {/* Role Header Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" /> Seniority
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                  {jobDescription.seniority}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Location
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                  {jobDescription.location}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Compensation
                </span>
                <span className="text-xs font-semibold text-emerald-300 mt-0.5 block truncate">
                  {jobDescription.compensation}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" /> Type
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                  {jobDescription.employmentType || 'Full-time'}
                </span>
              </div>
            </div>

            {/* About Company & Role Charter */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  About The Team &amp; Mission
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  {jobDescription.aboutCompany}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  The Role &amp; Core Charter
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  {jobDescription.roleOverview}
                </p>
              </div>
            </div>

            {/* Key Responsibilities */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="text-blue-400">&bull;</span> Key Responsibilities &amp; Impact
              </h3>
              <ul className="space-y-2">
                {jobDescription.responsibilities?.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2.5 text-slate-300 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60"
                  >
                    <span className="text-cyan-400 font-bold mt-0.5 text-xs">&rarr;</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hard Skills & Soft Skills side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Hard Skills &amp; Technical Mastery
                </h3>
                <ul className="space-y-2">
                  {jobDescription.hardSkills?.map((skill, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Soft Skills &amp; Leadership Signal
                </h3>
                <ul className="space-y-2">
                  {jobDescription.softSkills?.map((skill, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nice to Haves & Perks */}
            {jobDescription.niceToHaves && jobDescription.niceToHaves.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Bonus Qualifications (Nice-to-Haves)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {jobDescription.niceToHaves.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80"
                    >
                      + {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Perks */}
            {jobDescription.benefits && jobDescription.benefits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Benefits, Compensation &amp; Culture
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jobDescription.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-lg bg-slate-950/40 text-slate-300 border border-slate-800 flex items-center space-x-2"
                    >
                      <span className="text-emerald-400 font-bold">&check;</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to action & EOE */}
            {jobDescription.callToAction && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-200 block mb-1">How to Apply:</span>
                {jobDescription.callToAction}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINKEDIN RAW / COPYABLE TEXT */}
        {activeTab === 'formatted' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span>Character Count: </span>
                <span className={`font-semibold ${isLinkedInOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {charLength} chars
                </span>
                <span>&bull;</span>
                <span className="text-slate-400">
                  {isLinkedInOptimal ? 'Optimized for LinkedIn read rate' : 'Standard length'}
                </span>
              </div>
              <button
                onClick={() => handleCopy(jobDescription.linkedinFormattedText)}
                className="text-xs px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Formatted Post
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                {jobDescription.linkedinFormattedText}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: COMPETENCY MATRIX */}
        {activeTab === 'competencies' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                Hard Skills Mapped to Questions (Technical &amp; Execution)
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobDescription.skillsSummary?.hardSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {skill}
                  </span>
                )) ||
                  jobDescription.hardSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Soft Skills Mapped to Questions (Leadership, Comms, Culture)
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobDescription.skillsSummary?.softSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {skill}
                  </span>
                )) ||
                  jobDescription.softSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            {jobDescription.skillsSummary?.toolsAndTech && (
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Tooling, Libraries &amp; Frameworks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobDescription.skillsSummary.toolsAndTech.map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
