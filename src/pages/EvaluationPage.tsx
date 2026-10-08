import React, { useEffect, useState } from 'react';
import { evaluationService } from '../services/evaluationService';
import { EvaluationStats } from '../types';
import { EvaluationModal } from '../components/EvaluationModal';
import { BarChart3, Clock, Star, CheckCircle, Sparkles, Plus } from 'lucide-react';

export const EvaluationPage: React.FC = () => {
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await evaluationService.getStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load evaluation stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Research Evaluation & Empirical Metrics</span>
          </div>
          <h1 className="text-3xl font-black text-white">Traditional Search vs. Smart Bodim</h1>
          <p className="text-xs text-slate-400">Comparing manual student boarding search against context-aware recommendations</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" />
          Submit Evaluation Feedback
        </button>
      </div>

      {/* Main Highlights Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Time Saved Highlight */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900/80 p-6 backdrop-blur space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Clock className="h-4 w-4" />
              Efficiency Metric
            </div>
            <div className="text-4xl font-black text-emerald-300">{stats.time_saved_percentage}%</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Average reduction in student accommodation search time compared to manual searching.
            </p>
          </div>

          {/* Traditional Search Time */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Traditional Search Time</span>
            <div className="text-3xl font-black text-amber-400">
              {Math.round(stats.avg_traditional_search_time_sec / 60)} mins
            </div>
            <p className="text-xs text-slate-400">Manual calling, travelling & comparing listings</p>
          </div>

          {/* Smart Bodim Search Time */}
          <div className="rounded-3xl border border-cyan-500/30 bg-cyan-950/20 p-6 backdrop-blur space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Smart Bodim Time</span>
            <div className="text-3xl font-black text-cyan-300">
              {Math.round(stats.avg_smart_bodim_search_time_sec / 60)} mins
            </div>
            <p className="text-xs text-slate-300">Automated Weighted Scoring algorithm ranking</p>
          </div>
        </div>
      )}

      {/* Likert Scale User Satisfaction Scores */}
      {stats && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            User Evaluation Feedback (5-Point Likert Scale)
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Recommendation Relevance</span>
              <div className="text-3xl font-black text-amber-400">{stats.avg_relevance_rating.toFixed(2)} / 5.0</div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${(stats.avg_relevance_rating / 5) * 100}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">User Satisfaction</span>
              <div className="text-3xl font-black text-cyan-400">{stats.avg_satisfaction_rating.toFixed(2)} / 5.0</div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${(stats.avg_satisfaction_rating / 5) * 100}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Ease of Use</span>
              <div className="text-3xl font-black text-emerald-400">{stats.avg_ease_of_use_rating.toFixed(2)} / 5.0</div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${(stats.avg_ease_of_use_rating / 5) * 100}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Perceived Usefulness</span>
              <div className="text-3xl font-black text-purple-400">{stats.avg_perceived_usefulness_rating.toFixed(2)} / 5.0</div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: `${(stats.avg_perceived_usefulness_rating / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={fetchStats}
      />
    </div>
  );
};
