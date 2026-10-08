import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { studentService } from '../services/studentService';
import { RecommendationItem, StudentProfile } from '../types';
import { BoardingCard } from '../components/BoardingCard';
import { RecommendationExplanationModal } from '../components/RecommendationExplanationModal';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Filter, AlertCircle, RefreshCw } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | undefined>(undefined);
  const [coldStart, setColdStart] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);

  // Sorting & Filter states
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'distance' | 'safety' | 'facilities'>('match');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterMaxPrice, setFilterMaxPrice] = useState<number>(60000);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationService.getRecommendations();
      setRecommendations(res.recommendations);
      setStudentProfile(res.student_profile);
      setColdStart(res.cold_start);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleFavorite = async (boardingPlaceId: number) => {
    try {
      const res = await studentService.toggleFavorite(boardingPlaceId);
      setRecommendations((prev) =>
        prev.map((item) =>
          item.boarding_place.id === boardingPlaceId
            ? { ...item, is_favorite: res.saved }
            : item
        )
      );
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  // Process sorting & filters
  const filteredAndSortedList = useMemo(() => {
    let list = [...recommendations];

    // Filter by type
    if (filterType !== 'All') {
      list = list.filter((i) => i.boarding_place.accommodation_type === filterType);
    }

    // Filter by max price
    if (filterMaxPrice < 60000) {
      list = list.filter((i) => i.boarding_place.price <= filterMaxPrice);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'match') return b.match_score - a.match_score;
      if (sortBy === 'price') return a.boarding_place.price - b.boarding_place.price;
      if (sortBy === 'distance') return a.distance_km - b.distance_km;
      if (sortBy === 'safety') return b.boarding_place.safety_rating - a.boarding_place.safety_rating;
      if (sortBy === 'facilities') return (b.boarding_place.facilities?.length || 0) - (a.boarding_place.facilities?.length || 0);
      return 0;
    });

    return list;
  }, [recommendations, sortBy, filterType, filterMaxPrice]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Weighted Scoring Recommendation Engine</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white">Recommended Boarding Places</h1>
          <p className="text-xs text-slate-400">
            {studentProfile
              ? `Ranked for ${studentProfile.university} (Budget: Rs. ${studentProfile.budget.toLocaleString()})`
              : 'Ranked using context-aware student decision engine'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recalculate
          </button>
          <Link
            to="/student/preferences"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
          >
            Edit Preferences
          </Link>
        </div>
      </div>

      {/* Cold Start Banner */}
      {coldStart && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Complete your preference profile to receive 100% personalized context-aware recommendations.</span>
          </div>
          <Link
            to="/student/preferences"
            className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950"
          >
            Setup Profile
          </Link>
        </div>
      )}

      {/* Sorting & Filter Control Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">Sort By:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'match', label: 'Best Match Score' },
              { id: 'price', label: 'Lowest Price' },
              { id: 'distance', label: 'Nearest Campus' },
              { id: 'safety', label: 'Highest Safety' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  sortBy === s.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">Filter Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Single Room">Single Room</option>
            <option value="Shared Room">Shared Room</option>
            <option value="Annex">Annex</option>
            <option value="Apartment">Apartment</option>
          </select>
        </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : filteredAndSortedList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <p className="text-base font-semibold text-slate-300">No boarding places match your current search filters.</p>
          <button
            onClick={() => { setFilterType('All'); setFilterMaxPrice(60000); }}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedList.map((item) => (
            <BoardingCard
              key={item.boarding_place.id}
              item={item}
              onExplainClick={(i) => setSelectedItem(i)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Explanation Modal */}
      <RecommendationExplanationModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
