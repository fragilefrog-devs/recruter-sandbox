import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Columns,
  Maximize2,
  FileText,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { NotesInput } from './components/NotesInput';
import { JobDescriptionView } from './components/JobDescriptionView';
import { InterviewGuideView } from './components/InterviewGuideView';
import { RecruitmentChatbot } from './components/RecruitmentChatbot';
import { CandidateScorecardModal } from './components/CandidateScorecardModal';
import { RecruitmentKit, GenerationConfig, CandidateQuestionScore } from './types';
import { SAMPLE_ROLES } from './data/sampleNotes';

export default function App() {
  // Raw notes state
  const [rawNotes, setRawNotes] = useState<string>(SAMPLE_ROLES[0].rawNotes);
  const [config, setConfig] = useState<GenerationConfig>({
    seniority: 'Staff/Principal',
    workModel: 'Remote',
    tone: 'High-Growth Tech & Inspiring',
    useHighThinking: false,
    modelPreference: 'gemini-3.5-flash',
  });

  // Generated recruitment kit
  const [currentKit, setCurrentKit] = useState<RecruitmentKit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Active view layout: 'split' | 'jd' | 'guide' | 'edit_notes'
  const [viewMode, setViewMode] = useState<'split' | 'jd' | 'guide'>('split');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);

  // Interviewer scoring state
  const [scores, setScores] = useState<Record<number, CandidateQuestionScore>>({});
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);

  // Chatbot drawer state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);

  // Load saved kit from localStorage if present
  useEffect(() => {
    try {
      const savedKit = localStorage.getItem('recruitcraft_current_kit');
      if (savedKit) {
        const parsed = JSON.parse(savedKit);
        setCurrentKit(parsed);
      }
      const savedScores = localStorage.getItem('recruitcraft_scores');
      if (savedScores) {
        setScores(JSON.parse(savedScores));
      }
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (currentKit) {
      try {
        localStorage.setItem('recruitcraft_current_kit', JSON.stringify(currentKit));
      } catch (e) {
        console.warn('Failed to save kit to localStorage', e);
      }
    }
  }, [currentKit]);

  useEffect(() => {
    try {
      localStorage.setItem('recruitcraft_scores', JSON.stringify(scores));
    } catch (e) {
      console.warn('Failed to save scores', e);
    }
  }, [scores]);

  const handleUpdateScore = (questionId: number, update: Partial<CandidateQuestionScore>) => {
    setScores((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { rating: 0, notes: '', candidateAnswerDraft: '' }),
        ...update,
      },
    }));
  };

  const handleSelectSampleRole = (index: number) => {
    const sample = SAMPLE_ROLES[index];
    if (!sample) return;
    setRawNotes(sample.rawNotes);
    setConfig((prev) => ({
      ...prev,
      seniority: sample.seniority,
      workModel: sample.workModel,
      tone: sample.tone,
    }));
    setShowNotesDrawer(true);
  };

  const handleGenerate = async () => {
    if (!rawNotes.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Deconstructing raw notes & extracting competencies...');

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev.includes('Deconstructing')) return 'Calibrating seniority & technical mastery...';
        if (prev.includes('Calibrating')) return 'Synthesizing LinkedIn Job Description...';
        if (prev.includes('LinkedIn')) return 'Formulating 10 Targeted Behavioral STAR Questions...';
        if (prev.includes('Formulating')) return 'Building Green/Yellow/Red Flag rubrics...';
        return 'Finalizing Recruitment Kit...';
      });
    }, 2400);

    try {
      const response = await fetch('/api/generate-recruitment-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes,
          seniority: config.seniority,
          workModel: config.workModel,
          tone: config.tone,
          useHighThinking: config.useHighThinking,
          modelPreference: config.modelPreference,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const data = await response.json();
      setCurrentKit(data);
      setScores({}); // Reset scoring for new role
      setShowNotesDrawer(false);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      clearInterval(stepInterval);
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown generation error';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handlePolishJd = async (instruction: string) => {
    if (!currentKit?.jobDescription?.linkedinFormattedText) return;
    setIsPolishing(true);

    try {
      const res = await fetch('/api/polish-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentJdText: currentKit.jobDescription.linkedinFormattedText,
          adjustmentPrompt: instruction,
          requestedTone: config.tone,
        }),
      });

      if (!res.ok) throw new Error('Polish failed');
      const data = await res.json();

      if (data.polishedText) {
        setCurrentKit((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            jobDescription: {
              ...prev.jobDescription,
              linkedinFormattedText: data.polishedText,
            },
          };
        });

        confetti({
          particleCount: 40,
          spread: 60,
        });
      }
    } catch (e) {
      console.error(e);
      alert('Could not polish Job Description.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleReset = () => {
    if (confirm('Start a new role? This will clear the current generated Job Description and Interview Guide.')) {
      setCurrentKit(null);
      setScores({});
      localStorage.removeItem('recruitcraft_current_kit');
      localStorage.removeItem('recruitcraft_scores');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header */}
      <Header
        currentKit={currentKit}
        onReset={handleReset}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onOpenScorecard={() => setIsScorecardOpen(true)}
        onPrint={handlePrint}
        onSelectSampleRole={handleSelectSampleRole}
        sampleRoles={SAMPLE_ROLES}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start space-x-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Generation Error:</span>
              <p className="mt-0.5 text-xs text-rose-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-900/50"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* If NO KIT YET or Notes Drawer is explicitly shown */}
        {(!currentKit || showNotesDrawer) && (
          <div className="space-y-6 animate-fadeIn">
            {/* Value Proposition Hero if initial load */}
            {!currentKit && (
              <div className="text-center max-w-3xl mx-auto py-6 sm:py-8 space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Talent Acquisition Architecture Sandbox</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Turn Messy Hiring Notes into a{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                    LinkedIn JD &amp; 10-Question Behavioral Guide
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                  Paste unstructured requirements, tech stack wishlists, or hiring manager brain dumps.
                  RecruitCraft generates a high-converting LinkedIn Job Description and an interview loop with 10 targeted behavioral questions mapped directly to the JD&apos;s soft &amp; hard skills.
                </p>
              </div>
            )}

            {/* Input Component */}
            <NotesInput
              rawNotes={rawNotes}
              setRawNotes={setRawNotes}
              config={config}
              setConfig={setConfig}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              loadingStep={loadingStep}
            />

            {/* Close notes drawer button if kit already exists */}
            {currentKit && showNotesDrawer && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNotesDrawer(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel and return to current role kit &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* GENERATED RECRUITMENT KIT VIEW */}
        {currentKit && !showNotesDrawer && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top Kit Navigation & Calibration Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white">
                    {currentKit.jobDescription.jobTitle}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Kit Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{currentKit.jobDescription.seniority}</span>
                  <span>&bull;</span>
                  <span>{currentKit.jobDescription.location}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-medium">
                    {currentKit.jobDescription.compensation}
                  </span>
                  <span>&bull;</span>
                  <span className="font-mono text-slate-400">
                    Model: {currentKit.modelUsed}
                  </span>
                  {currentKit.fallbackEngaged && (
                    <>
                      <span>&bull;</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                        OpenAI Fallback
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center space-x-2 self-start sm:self-center">
                <button
                  onClick={() => setShowNotesDrawer(true)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Raw Notes</span>
                </button>

                <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      viewMode === 'split'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Side-by-side view"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Split View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('jd')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      viewMode === 'jd'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>LinkedIn JD</span>
                  </button>
                  <button
                    onClick={() => setViewMode('guide')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      viewMode === 'guide'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Interview Guide (10)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Strategic Notes / Thinking Process if available */}
            {(currentKit.seniorityCalibrationNotes || currentKit.thinkingProcess) && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200/90 flex items-start space-x-2.5">
                <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-semibold text-purple-300 block">
                    Talent Architecture &amp; Seniority Calibration Strategy:
                  </span>
                  <p className="leading-relaxed">
                    {currentKit.seniorityCalibrationNotes || currentKit.thinkingProcess}
                  </p>
                </div>
              </div>
            )}

            {/* Split View or Focused Views */}
            <div
              className={`grid gap-6 ${
                viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Output 1: LinkedIn Job Description */}
              {(viewMode === 'split' || viewMode === 'jd') && (
                <div className="min-w-0">
                  <JobDescriptionView
                    jobDescription={currentKit.jobDescription}
                    onPolishJd={handlePolishJd}
                    isPolishing={isPolishing}
                  />
                </div>
              )}

              {/* Output 2: Behavioral Interview Guide (10 Questions) */}
              {(viewMode === 'split' || viewMode === 'guide') && (
                <div className="min-w-0">
                  <InterviewGuideView
                    interviewGuide={currentKit.interviewGuide}
                    scores={scores}
                    onUpdateScore={handleUpdateScore}
                    onOpenScorecard={() => setIsScorecardOpen(true)}
                    roleTitle={currentKit.jobDescription.jobTitle}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Recruiter Copilot Trigger (Bottom right on mobile/desktop) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 group"
        >
          <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          <span className="text-xs font-bold tracking-tight pr-1">Recruiting Copilot</span>
        </button>
      )}

      {/* Recruiter Chatbot Drawer */}
      <RecruitmentChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentKit={currentKit}
        rawNotes={rawNotes}
      />

      {/* Candidate Scorecard & Debrief Modal */}
      {currentKit && (
        <CandidateScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => setIsScorecardOpen(false)}
          questions={currentKit.interviewGuide.questions}
          scores={scores}
          roleTitle={currentKit.jobDescription.jobTitle}
        />
      )}
    </div>
  );
}
