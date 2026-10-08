import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { boardingService } from '../services/boardingService';
import { Facility, StudentProfile, PriorityLevel, WeightPriorityInput } from '../types';
import { WeightSliderCard } from '../components/WeightSliderCard';
import { FacilitiesPicker } from '../components/FacilitiesPicker';
import { Sliders, MapPin, DollarSign, Shield, BookOpen, Check, Sparkles, Building2, Save } from 'lucide-react';

const UNIVERSITIES = [
  { name: 'University of Colombo (Reid Avenue)', lat: 6.9000, lng: 79.8588 },
  { name: 'University of Moratuwa (Katubedda)', lat: 6.7975, lng: 79.9015 },
  { name: 'University of Kelaniya', lat: 6.9739, lng: 79.9158 },
  { name: 'SLIIT Malabe Campus', lat: 6.9060, lng: 79.9680 },
  { name: 'NSBM Green University (Pitipana)', lat: 6.8210, lng: 80.0400 },
  { name: 'University of Peradeniya (Kandy)', lat: 7.2543, lng: 80.5925 },
];

export const PreferencesPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    university: 'University of Colombo (Reid Avenue)',
    university_latitude: 6.9000,
    university_longitude: 79.8588,
    budget: 25000,
    preferred_distance: 3.0,
    safety_preference: 4,
    study_environment_preference: 4,
    accommodation_type: 'Single Room',
    gender_preference: 'Any',
    occupants: 1,
    required_facility_ids: [],
  });

  const [weights, setWeights] = useState<WeightPriorityInput>({
    budget_priority: 'Very Important',
    distance_priority: 'Important',
    facilities_priority: 'Normal',
    safety_priority: 'Very Important',
    study_environment_priority: 'Normal',
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const [facRes, profRes] = await Promise.all([
          boardingService.getFacilities(),
          studentService.getProfile(),
        ]);
        setFacilities(facRes);

        if (profRes) {
          setProfile(profRes);
          // Convert numeric weights back to priorities if available
          setWeights({
            budget_priority: rawToPriority(profRes.budget_weight),
            distance_priority: rawToPriority(profRes.distance_weight),
            facilities_priority: rawToPriority(profRes.facilities_weight),
            safety_priority: rawToPriority(profRes.safety_weight),
            study_environment_priority: rawToPriority(profRes.study_environment_weight),
          });
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const rawToPriority = (val?: number): PriorityLevel => {
    if (!val) return 'Normal';
    if (val >= 30) return 'Very Important';
    if (val >= 22) return 'Important';
    if (val >= 12) return 'Normal';
    return 'Low';
  };

  const handleUniChange = (name: string) => {
    const uni = UNIVERSITIES.find((u) => u.name === name);
    if (uni) {
      setProfile((prev) => ({
        ...prev,
        university: uni.name,
        university_latitude: uni.lat,
        university_longitude: uni.lng,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      await studentService.updateProfile({
        ...profile,
        weights,
      });
      setSuccessMessage('Preferences updated successfully! Calculating top recommendations...');
      setTimeout(() => {
        navigate('/recommendations');
      }, 1200);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <Sliders className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Student Accommodation Preferences</h1>
          <p className="text-xs text-slate-400">Configure your requirements & dynamic priority weights for Smart Bodim</p>
        </div>
      </div>

      {successMessage && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Section 1: Campus & Budget */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="h-5 w-5 text-cyan-400" />
            1. Location & Budget Constraints
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-300">University / Institution Location</label>
              <select
                value={profile.university}
                onChange={(e) => handleUniChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
              <span className="mt-1 text-[11px] text-slate-400">
                Coords: {profile.university_latitude}, {profile.university_longitude}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Maximum Monthly Budget</label>
                <span className="font-bold text-cyan-400">Rs. {profile.budget?.toLocaleString()} / mo</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="1000"
                value={profile.budget}
                onChange={(e) => setProfile({ ...profile, budget: Number(e.target.value) })}
                className="mt-3 w-full accent-cyan-400"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>Rs. 10,000</span>
                <span>Rs. 60,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Maximum Preferred Distance</label>
                <span className="font-bold text-indigo-400">{profile.preferred_distance} km from university</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.5"
                value={profile.preferred_distance}
                onChange={(e) => setProfile({ ...profile, preferred_distance: Number(e.target.value) })}
                className="mt-3 w-full accent-indigo-400"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>0.5 km</span>
                <span>15.0 km</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Accommodation Type</label>
              <select
                value={profile.accommodation_type}
                onChange={(e) => setProfile({ ...profile, accommodation_type: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Single Room">Single Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Annex">Annex</option>
                <option value="Apartment">Studio Apartment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Facilities Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Check className="h-5 w-5 text-indigo-400" />
              2. Required Facilities Checklist
            </h3>
            <span className="text-xs text-slate-400">
              {profile.required_facility_ids?.length || 0} selected
            </span>
          </div>

          <FacilitiesPicker
            facilities={facilities}
            selectedIds={profile.required_facility_ids || []}
            onChange={(ids) => setProfile({ ...profile, required_facility_ids: ids })}
          />
        </div>

        {/* Section 3: Dynamic Weights Priority Setter */}
        <WeightSliderCard weights={weights} onChange={setWeights} />

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {saving ? 'Saving Preferences...' : 'Save & Calculate Recommendations'}
          </button>
        </div>
      </form>
    </div>
  );
};
