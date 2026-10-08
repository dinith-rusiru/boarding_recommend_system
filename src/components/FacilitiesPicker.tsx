import React from 'react';
import { Facility } from '../types';
import { Check } from 'lucide-react';

interface FacilitiesPickerProps {
  facilities: Facility[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export const FacilitiesPicker: React.FC<FacilitiesPickerProps> = ({ facilities, selectedIds, onChange }) => {
  const toggleFacility = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
      {facilities.map((f) => {
        const isSelected = selectedIds.includes(f.id);
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => toggleFacility(f.id)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
              isSelected
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 shadow-sm shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-colors ${
                isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700 bg-slate-800'
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
            <span className="text-xs font-medium">{f.name}</span>
          </button>
        );
      })}
    </div>
  );
};
