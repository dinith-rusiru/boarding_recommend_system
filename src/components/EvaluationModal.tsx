import React, { useState } from 'react';
import { X, Star, Clock, CheckCircle, BarChart2 } from 'lucide-react';
import { evaluationService } from '../services/evaluationService';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [searchMode, setSearchMode] = useState<'traditional' | 'smart_bodim'>('smart_bodim');
  const [searchTimeSec, setSearchTimeSec] = useState<number>(180); // 3 mins
  const [relevance, setRelevance] = useState<number>(5);
  const [satisfaction, setSatisfaction] = useState<number>(5);
  const [easeOfUse, setEaseOfUse] = useState<number>(5);
  const [usefulness, setUsefulness] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await evaluationService.submitEvaluation({
        search_mode: searchMode,
        search_time_seconds: Number(searchTimeSec),
        relevance_rating: relevance,
        satisfaction_rating: satisfaction,
        ease_of_use_rating: easeOfUse,
        perceived_usefulness_rating: usefulness,
        comments
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">Feedback Submitted!</h3>
            <p className="mt-2 text-xs text-slate-400">
              Thank you for contributing to the Smart Bodim research evaluation data.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Smart Bodim Research Evaluation</h2>
                <p className="text-xs text-slate-400">Compare your boarding search experience</p>
              </div>
            </div>

            {/* Search Mode Toggle */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Search Methodology</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setSearchMode('traditional'); setSearchTimeSec(1200); }}
                  className={`rounded-xl border p-3 text-left text-xs transition-all ${
                    searchMode === 'traditional'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Traditional Search</div>
                  <div className="text-[10px] opacity-75">Manual calling, visiting & filtering</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchMode('smart_bodim'); setSearchTimeSec(180); }}
                  className={`rounded-xl border p-3 text-left text-xs transition-all ${
                    searchMode === 'smart_bodim'
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Smart Bodim Engine</div>
                  <div className="text-[10px] opacity-75">Weighted Scoring recommendation</div>
                </button>
              </div>
            </div>

            {/* Search Time Spent */}
            <div>
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Estimated Search Time</label>
                <span className="font-bold text-cyan-400">{Math.round(searchTimeSec / 60)} minutes ({searchTimeSec} sec)</span>
              </div>
              <input
                type="range"
                min="30"
                max="3600"
                step="30"
                value={searchTimeSec}
                onChange={(e) => setSearchTimeSec(Number(e.target.value))}
                className="mt-2 w-full accent-cyan-400"
              />
            </div>

            {/* Likert Ratings */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Likert Satisfaction Scale (1-5)</h4>

              {[
                { label: 'Recommendation Relevance', state: relevance, setter: setRelevance },
                { label: 'Overall User Satisfaction', state: satisfaction, setter: setSatisfaction },
                { label: 'Ease of Use & Navigation', state: easeOfUse, setter: setEaseOfUse },
                { label: 'Perceived System Usefulness', state: usefulness, setter: setUsefulness },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => item.setter(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            star <= item.state ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Additional Comments / Feedback</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience using Smart Bodim..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Action */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Research Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
