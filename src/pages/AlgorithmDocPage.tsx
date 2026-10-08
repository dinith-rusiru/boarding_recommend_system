import React from 'react';
import { BookOpen, Calculator, Sliders, MapPin, DollarSign, Shield, CheckCircle2 } from 'lucide-react';

export const AlgorithmDocPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-12">
      {/* Page Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Research Methodology & Technical Documentation</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Weighted Scoring Recommendation Engine Methodology
        </h1>
        <p className="text-sm leading-relaxed text-slate-300">
          Detailed mathematical formulation of the context-aware boarding place decision model for Smart Bodim.
        </p>
      </div>

      {/* 1. Mathematical Formulation */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-cyan-400" />
          1. Core Weighted Recommendation Equation
        </h2>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 text-center">
          <div className="text-2xl font-black font-mono bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            S = Σ (wᵢ × sᵢ) = (w_budget × s_budget) + (w_dist × s_dist) + (w_fac × s_fac) + (w_safe × s_safe) + (w_study × s_study)
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Where S ∈ [0, 100]% is the final Match Score, wᵢ is the normalized weight of criterion i, and sᵢ ∈ [0, 100] is the normalized score of criterion i.
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300">
          Constraint: Σ wᵢ = 1.0 (100% total weight)
        </div>
      </section>

      {/* 2. Weight Normalization */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          2. Dynamic User Preference Weight Conversion
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          Students prioritize criteria using four qualitative levels: Very Important, Important, Normal, and Low Importance. These are mapped to raw numerical weights Wᵢ and normalized:
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 font-bold text-center">
            Very Important = 35 pts
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-300 font-bold text-center">
            Important = 25 pts
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-300 font-bold text-center">
            Normal = 15 pts
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-400 font-bold text-center">
            Low = 5 pts
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300 text-center">
          wᵢ = Wᵢ / Σ Wⱼ
        </div>
      </section>

      {/* 3. Individual Criteria Scoring Functions */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-400" />
          3. Individual Criterion Scoring Formulas (sᵢ)
        </h2>

        <div className="space-y-6">
          {/* Haversine Distance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-bold text-cyan-400">A. Haversine Geospatial Distance Formula</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates exact spherical distance d (in km) between student's university coordinates (lat₁, lon₁) and boarding place coordinates (lat₂, lon₂):
            </p>
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300">
              d = 2R × atan2( √a, √(1 - a) ) <br />
              where a = sin²(Δlat / 2) + cos(lat₁) × cos(lat₂) × sin²(Δlon / 2), and R = 6371 km
            </div>
            <p className="text-xs text-slate-400">
              Distance score decays exponentially if distance d exceeds preferred distance dₚ:
            </p>
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-cyan-300">
              s_dist = 100 - 15 × (d / dₚ)  [if d ≤ dₚ] <br />
              s_dist = 85 × exp( -0.8 × (d - dₚ) / dₚ )  [if d &gt; dₚ]
            </div>
          </div>

          {/* Budget Scoring */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400">B. Budget Normalized Curve</h3>
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300">
              s_budget = 85 + 15 × ((Budget - Price) / Budget)  [if Price ≤ Budget] <br />
              s_budget = 85 × exp( -2.0 × (Price - Budget) / Budget )  [if Price &gt; Budget]
            </div>
          </div>

          {/* Facility Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-bold text-indigo-400">C. Facility Match Ratio</h3>
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-indigo-300">
              s_fac = (|Matched Facilities| / |Required Facilities|) × 100%
            </div>
          </div>
        </div>
      </section>

      {/* 4. Explainability */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-amber-400" />
          4. Recommendation Explainability Engine
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The system evaluates individual criterion scores sᵢ against thresholds to generate transparent pros (✓) and cautions (⚠️) so students understand exactly why a property was recommended.
        </p>
      </section>
    </div>
  );
};
