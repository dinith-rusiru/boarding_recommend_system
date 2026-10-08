import React from 'react';
import { RecommendationItem } from '../types';
import { X, Sparkles, CheckCircle2, AlertTriangle, Scale, Calculator } from 'lucide-react';

interface ModalProps {
  item: RecommendationItem | null;
  onClose: () => void;
}

export const RecommendationExplanationModal: React.FC<ModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const { boarding_place, match_score, distance_km, breakdown, weights, reasons, weaknesses } = item;

  const criteria = [
    { key: 'budget', label: 'Budget Score', score: breakdown.budget, weight: weights.budget, color: 'bg-emerald-500' },
    { key: 'distance', label: 'Distance Score', score: breakdown.distance, weight: weights.distance, color: 'bg-cyan-500' },
    { key: 'facilities', label: 'Facility Matching', score: breakdown.facilities, weight: weights.facilities, color: 'bg-indigo-500' },
    { key: 'safety', label: 'Safety Rating', score: breakdown.safety, weight: weights.safety, color: 'bg-purple-500' },
    { key: 'study_environment', label: 'Study Environment', score: breakdown.study_environment, weight: weights.study_environment, color: 'bg-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Why This Place Was Recommended</h2>
            <p className="text-xs text-slate-400">{boarding_place.title}</p>
          </div>
        </div>

        {/* Match Score Banner */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Final Match Score</span>
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {match_score.toFixed(1)}% Match
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Distance from University</span>
            <div className="text-base font-bold text-white">{distance_km} km</div>
          </div>
        </div>

        {/* Strengths / Positive Reasons */}
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Matching Strengths ({reasons.length})
          </h3>
          <ul className="mt-2.5 space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-300">
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaker Areas / Cautions */}
        {weaknesses && weaknesses.length > 0 && (
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Weaker Criteria ({weaknesses.length})
            </h3>
            <ul className="mt-2.5 space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-300">
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Criteria Breakdown Progress Bars */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Criteria Score Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Individual Score (Weight)</span>
          </div>

          <div className="mt-4 space-y-3.5">
            {criteria.map((c) => (
              <div key={c.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.score.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500">({c.weight}% weight)</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full ${c.color} transition-all duration-500`}
                    style={{ width: `${Math.max(5, c.score)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
