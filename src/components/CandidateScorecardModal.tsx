import React, { useState } from 'react';
import {
  X,
  Award,
  Star,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Printer,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BehavioralQuestion, CandidateQuestionScore } from '../types';

interface CandidateScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: BehavioralQuestion[];
  scores: Record<number, CandidateQuestionScore>;
  roleTitle: string;
}

export const CandidateScorecardModal: React.FC<CandidateScorecardModalProps> = ({
  isOpen,
  onClose,
  questions,
  scores,
  roleTitle,
}) => {
  const [candidateName, setCandidateName] = useState('Alex Morgan');
  const [interviewerName, setInterviewerName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate statistics
  const scoredItems = questions.map((q) => ({
    question: q,
    score: scores[q.id] || { rating: 0, notes: '' },
  }));

  const ratedItems = scoredItems.filter((item) => item.score.rating > 0);
  const totalRating = ratedItems.reduce((acc, curr) => acc + curr.score.rating, 0);
  const averageRating = ratedItems.length > 0 ? (totalRating / ratedItems.length).toFixed(1) : 'N/A';

  // Recommendation logic
  const numAvg = parseFloat(averageRating);
  let recommendation = 'Pending Ratings';
  let recommendationColor = 'text-slate-400 bg-slate-800 border-slate-700';

  if (!isNaN(numAvg)) {
    if (numAvg >= 4.5) {
      recommendation = 'STRONG HIRE (Top 5% Candidate)';
      recommendationColor = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
    } else if (numAvg >= 3.8) {
      recommendation = 'HIRE (Meets & Exceeds Bar)';
      recommendationColor = 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40';
    } else if (numAvg >= 3.0) {
      recommendation = 'LEANING HIRE / MIXED SIGNALS';
      recommendationColor = 'text-amber-300 bg-amber-500/20 border-amber-500/40';
    } else {
      recommendation = 'NO HIRE (Below Competency Bar)';
      recommendationColor = 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    }
  }

  const handleCopyDebrief = () => {
    let debriefText = `# Candidate Interview Debrief: ${candidateName || 'Candidate'}\n`;
    debriefText += `Role: ${roleTitle}\n`;
    if (interviewerName) debriefText += `Interviewer: ${interviewerName}\n`;
    debriefText += `Date: ${new Date().toLocaleDateString()}\n`;
    debriefText += `Overall Score: ${averageRating} / 5.0 (${ratedItems.length} of ${questions.length} questions rated)\n`;
    debriefText += `Recommendation: ${recommendation}\n\n`;
    debriefText += `## Question-by-Question Competency Scorecard\n\n`;

    scoredItems.forEach(({ question, score }) => {
      debriefText += `### Q${question.id} [${question.category === 'hard_skill' ? 'HARD SKILL' : 'SOFT SKILL'}]: ${question.targetSkill}\n`;
      debriefText += `Rating: ${score.rating > 0 ? `${score.rating}/5` : 'Not Rated'}\n`;
      if (score.notes) debriefText += `Notes: ${score.notes}\n`;
      if (score.aiEvaluation) {
        debriefText += `AI Bar Raiser: ${score.aiEvaluation.score}/5\n`;
        debriefText += `Strengths: ${score.aiEvaluation.strengths?.join(', ')}\n`;
        debriefText += `Concerns: ${score.aiEvaluation.concerns?.join(', ')}\n`;
      }
      debriefText += `\n`;
    });

    navigator.clipboard.writeText(debriefText);
    setCopied(true);
    confetti({
      particleCount: 45,
      spread: 60,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Candidate Debrief &amp; Scorecard
              </h2>
              <p className="text-xs text-slate-400">
                10-Question Behavioral Evaluation for {roleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Candidate & Interviewer inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Candidate name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Interviewer Name (Optional)
              </label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Interviewer name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Aggregated Score & Recommendation Header */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Overall Behavioral Score
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-white">
                  {averageRating}
                </span>
                <span className="text-slate-400 font-medium">/ 5.0</span>
                <span className="text-slate-500 text-[11px]">
                  ({ratedItems.length} of {questions.length} questions rated)
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border font-bold text-xs ${recommendationColor}`}>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-0.5">
                Loop Recommendation
              </div>
              {recommendation}
            </div>
          </div>

          {/* 10-Question Score Breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">
              Behavioral Competency Breakdown
            </h3>
            <div className="space-y-2">
              {scoredItems.map(({ question, score }) => (
                <div
                  key={question.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-6 h-6 rounded bg-slate-800 font-mono font-bold text-[11px] text-slate-300 flex items-center justify-center shrink-0">
                      Q{question.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-slate-200 truncate">
                          {question.targetSkill}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            question.category === 'hard_skill'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {question.category === 'hard_skill' ? 'Hard' : 'Soft'}
                        </span>
                      </div>
                      {score.notes && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Notes: {score.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {score.rating > 0 ? (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{score.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Not rated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleCopyDebrief}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Debrief Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Debrief to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
