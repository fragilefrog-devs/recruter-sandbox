import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Copy,
  Check,
  Filter,
  UserCheck,
  Send,
  MessageSquare,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InterviewGuide, BehavioralQuestion, CandidateQuestionScore } from '../types';

interface InterviewGuideViewProps {
  interviewGuide: InterviewGuide;
  scores: Record<number, CandidateQuestionScore>;
  onUpdateScore: (questionId: number, update: Partial<CandidateQuestionScore>) => void;
  onOpenScorecard: () => void;
  roleTitle: string;
}

export const InterviewGuideView: React.FC<InterviewGuideViewProps> = ({
  interviewGuide,
  scores,
  onUpdateScore,
  onOpenScorecard,
  roleTitle,
}) => {
  const [filter, setFilter] = useState<'all' | 'hard_skill' | 'soft_skill'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });
  const [copied, setCopied] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [evaluatingLoading, setEvaluatingLoading] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    interviewGuide.questions.forEach((q) => {
      allExpanded[q.id] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const questions = interviewGuide.questions || [];
  const filteredQuestions = questions.filter((q) => {
    if (filter === 'all') return true;
    return q.category === filter;
  });

  const hardSkillsCount = questions.filter((q) => q.category === 'hard_skill').length;
  const softSkillsCount = questions.filter((q) => q.category === 'soft_skill').length;

  // Calculate scored progress
  const scoredCount = Object.values(scores).filter((s) => s.rating > 0).length;

  const handleCopyGuide = () => {
    let guideText = `# Behavioral Interview Guide: ${interviewGuide.roleTitle || roleTitle}\n\n`;
    guideText += `Estimated Duration: ${interviewGuide.estimatedDurationMinutes} minutes\n`;
    guideText += `Summary: ${interviewGuide.summary}\n\n`;
    guideText += `## Target Competencies\n`;
    interviewGuide.targetCompetenciesOverview?.forEach((c) => {
      guideText += `- [${c.type === 'hard_skill' ? 'Hard Skill' : 'Soft Skill'}] ${c.name}: ${c.description}\n`;
    });
    guideText += `\n---\n\n`;

    questions.forEach((q) => {
      guideText += `### Question ${q.id} [${q.category === 'hard_skill' ? 'HARD SKILL' : 'SOFT SKILL'}]: Target: ${q.targetSkill}\n`;
      guideText += `Prompt: "${q.question}"\n\n`;
      guideText += `Intent: ${q.intent}\n\n`;
      guideText += `Follow-up Probes:\n`;
      q.followUpProbes?.forEach((p) => {
        guideText += `- ${p}\n`;
      });
      guideText += `\nSTAR Evaluation Rubric:\n`;
      guideText += `- [Strong Signal / Green Flags]: ${q.rubric.strongSignal}\n`;
      guideText += `- [Acceptable Signal / Yellow Flags]: ${q.rubric.acceptableSignal}\n`;
      guideText += `- [Red Flags]: ${q.rubric.redFlags}\n\n`;
      guideText += `---\n\n`;
    });

    navigator.clipboard.writeText(guideText);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEvaluateAnswer = async (q: BehavioralQuestion) => {
    const currentScore = scores[q.id];
    const candidateAnswer = currentScore?.candidateAnswerDraft;
    if (!candidateAnswer || !candidateAnswer.trim()) {
      alert('Please enter or paste the candidate’s response before requesting an AI evaluation.');
      return;
    }

    try {
      setEvaluatingLoading(true);
      const res = await fetch('/api/evaluate-candidate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          rubric: q.rubric,
          candidateAnswer,
          targetSkill: q.targetSkill,
          roleTitle,
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();

      onUpdateScore(q.id, {
        rating: data.score || 3,
        aiEvaluation: data,
      });
    } catch (err) {
      console.error(err);
      alert('Could not evaluate candidate answer. Please try again.');
    } finally {
      setEvaluatingLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm flex flex-col h-full">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Behavioral Interview Guide
              </h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                10 Questions &bull; STAR Rubrics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Directly mapped to JD skills &bull; {hardSkillsCount} Hard Skill &bull; {softSkillsCount} Soft Skill questions
            </p>
          </div>
        </div>

        {/* Top Actions: Copy, Expand, Scorecard */}
        <div className="flex items-center space-x-2">
          {scoredCount > 0 && (
            <button
              onClick={onOpenScorecard}
              className="text-xs py-1.5 px-3 rounded-xl font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scorecard ({scoredCount}/10)</span>
            </button>
          )}

          <button
            onClick={handleCopyGuide}
            className={`text-xs py-1.5 px-3 rounded-xl font-medium border flex items-center space-x-1.5 transition-all shadow-sm ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guide Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Guide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Expand/Collapse Bar */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 mr-1 font-medium">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All 10 Questions
          </button>
          <button
            onClick={() => setFilter('hard_skill')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filter === 'hard_skill'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Hard Skills ({hardSkillsCount})
          </button>
          <button
            onClick={() => setFilter('soft_skill')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filter === 'soft_skill'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Soft Skills ({softSkillsCount})
          </button>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <button
            onClick={expandAll}
            className="hover:text-slate-200 transition-colors"
          >
            Expand All
          </button>
          <span>&bull;</span>
          <button
            onClick={collapseAll}
            className="hover:text-slate-200 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Guide Overview Banner */}
      {interviewGuide.summary && (
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Loop Strategy: </span>
          {interviewGuide.summary}
        </div>
      )}

      {/* Question Cards List */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[640px] space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = !!expandedIds[q.id];
          const score = scores[q.id] || { rating: 0, notes: '', candidateAnswerDraft: '' };
          const isHardSkill = q.category === 'hard_skill';

          return (
            <div
              key={q.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-slate-950/80 border-slate-700 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Question Card Header */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-3.5 sm:p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
              >
                <div className="flex items-start space-x-3">
                  {/* Number Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      isHardSkill
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Q{q.id}
                  </div>

                  <div>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          isHardSkill
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isHardSkill ? 'Hard Skill' : 'Soft Skill'}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Target: {q.targetSkill}
                      </span>
                      {score.rating > 0 && (
                        <span className="text-xs text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {score.rating}/5
                        </span>
                      )}
                    </div>

                    {/* Question Prompt */}
                    <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                      &ldquo;{q.question}&rdquo;
                    </h3>
                  </div>
                </div>

                <div className="text-slate-400 hover:text-slate-200 mt-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-4 text-xs animate-fadeIn">
                  {/* Interviewer Intent */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="font-bold text-slate-200 uppercase text-[10px] tracking-wider block mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Interviewer&apos;s Intent
                    </span>
                    <p className="leading-relaxed">{q.intent}</p>
                  </div>

                  {/* Follow-up Probing Questions */}
                  {q.followUpProbes && q.followUpProbes.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider block mb-1.5 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Surgical Follow-Up Probes (If Candidate Is Vague)
                      </span>
                      <ul className="space-y-1.5">
                        {q.followUpProbes.map((probe, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-slate-300">
                            <span className="text-indigo-400 font-bold">&rsaquo;</span>
                            <span>{probe}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* STAR Scoring Rubric */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* Strong Signal */}
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-slate-300">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Strong Signal (Green Flags)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-100/90">
                        {q.rubric.strongSignal}
                      </p>
                    </div>

                    {/* Acceptable Signal */}
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-slate-300">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Acceptable (Yellow Flags)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-100/90">
                        {q.rubric.acceptableSignal}
                      </p>
                    </div>

                    {/* Red Flags */}
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-slate-300">
                      <div className="flex items-center space-x-1.5 text-rose-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Red Flags (Warning Signs)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-100/90">
                        {q.rubric.redFlags}
                      </p>
                    </div>
                  </div>

                  {/* Live Interviewer Scoring & Answer Testing Widget */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">Interviewer Score:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onUpdateScore(q.id, { rating: star })}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= score.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 ml-1.5 font-medium">
                            {score.rating > 0 ? `${score.rating}/5` : 'Not Rated'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEvaluatingId(evaluatingId === q.id ? null : q.id)
                        }
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {evaluatingId === q.id ? 'Close AI Evaluator' : 'Test Candidate Answer with AI'}
                        </span>
                      </button>
                    </div>

                    {/* Interviewer Notes textarea */}
                    <div>
                      <input
                        type="text"
                        placeholder="Interviewer quick observation / evidence notes..."
                        value={score.notes}
                        onChange={(e) => onUpdateScore(q.id, { notes: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    {/* AI Candidate Answer Tester Drawer */}
                    {evaluatingId === q.id && (
                      <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-lg space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> AI Bar Raiser: Candidate Answer Simulator
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Grades Situation, Task, Action, Result
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={score.candidateAnswerDraft || ''}
                          onChange={(e) =>
                            onUpdateScore(q.id, { candidateAnswerDraft: e.target.value })
                          }
                          placeholder="Paste or type what the candidate answered to test against the rubric..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none font-sans"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={evaluatingLoading || !score.candidateAnswerDraft?.trim()}
                            onClick={() => handleEvaluateAnswer(q)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {evaluatingLoading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Evaluating Answer...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Evaluate Candidate Response</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Evaluation results */}
                        {score.aiEvaluation && (
                          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 bg-slate-900/60 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">
                                AI Assessment Score: {score.aiEvaluation.score}/5
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                STAR Breakdown
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-400 block">Situation:</span>
                                <span className="text-slate-300">{score.aiEvaluation.starBreakdown?.situation}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-400 block">Task:</span>
                                <span className="text-slate-300">{score.aiEvaluation.starBreakdown?.task}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-400 block">Action:</span>
                                <span className="text-slate-300">{score.aiEvaluation.starBreakdown?.action}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-400 block">Result:</span>
                                <span className="text-slate-300">{score.aiEvaluation.starBreakdown?.result}</span>
                              </div>
                            </div>

                            {score.aiEvaluation.recommendedFollowUp && (
                              <div className="p-2 rounded bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-indigo-200">
                                <span className="font-bold block text-indigo-300">
                                  Recommended Next Follow-up Probe:
                                </span>
                                &ldquo;{score.aiEvaluation.recommendedFollowUp}&rdquo;
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
