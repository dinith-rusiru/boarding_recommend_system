import React from 'react';
import { PriorityLevel, WeightPriorityInput } from '../types';
import { Sliders, HelpCircle } from 'lucide-react';

interface WeightSliderCardProps {
  weights: WeightPriorityInput;
  onChange: (newWeights: WeightPriorityInput) => void;
}

const PRIORITIES: PriorityLevel[] = ['Very Important', 'Important', 'Normal', 'Low'];

const getPriorityBadgeColor = (p: PriorityLevel) => {
  switch (p) {
    case 'Very Important': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'Important': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    case 'Normal': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'Low': return 'bg-slate-700/50 text-slate-400 border-slate-700';
  }
};

export const WeightSliderCard: React.FC<WeightSliderCardProps> = ({ weights, onChange }) => {
  const handleChange = (category: keyof WeightPriorityInput, level: PriorityLevel) => {
    onChange({
      ...weights,
      [category]: level,
    });
  };

  const categories: { key: keyof WeightPriorityInput; label: string; desc: string }[] = [
    { key: 'budget_priority', label: 'Maximum Monthly Budget', desc: 'Price affordability & monthly rent savings' },
    { key: 'distance_priority', label: 'Distance from University', desc: 'Proximity to campus & travel convenience' },
    { key: 'facilities_priority', label: 'Required Facilities', desc: 'Match count against your required facility checklist' },
    { key: 'safety_priority', label: 'Safety & Security', desc: 'Landlord safety rating, CCTV & security guard presence' },
    { key: 'study_environment_priority', label: 'Study Environment', desc: 'Quietness, study desk availability & learning atmosphere' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Contextual Priority Weights</h3>
        </div>
        <span className="text-xs text-slate-400">Personalizes Recommendation Scores</span>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Adjust how much each criterion matters to you (e.g. "I care more about distance than price"). The system automatically normalizes your choices into normalized mathematical weights totaling 100%.
      </p>

      <div className="mt-5 space-y-4">
        {categories.map((c) => (
          <div key={c.key} className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">{c.label}</span>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeColor(weights[c.key])}`}>
                  {weights[c.key]}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.desc}</p>
            </div>

            <div className="flex items-center gap-1 mt-2 sm:mt-0">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleChange(c.key, p)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    weights[c.key] === p
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
