import React from 'react';
import { RecommendationItem } from '../types';
import { MapPin, Heart, Sparkles, CheckCircle2, Shield, BookOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BoardingCardProps {
  item: RecommendationItem;
  onExplainClick: (item: RecommendationItem) => void;
  onToggleFavorite?: (id: number) => void;
}

export const BoardingCard: React.FC<BoardingCardProps> = ({ item, onExplainClick, onToggleFavorite }) => {
  const { boarding_place, match_score, distance_km, is_favorite, reasons } = item;
  const mainImage = boarding_place.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  // Color badge based on match score
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-600 text-emerald-100 shadow-emerald-500/20';
    if (score >= 70) return 'from-cyan-500 to-blue-600 text-cyan-100 shadow-cyan-500/20';
    if (score >= 50) return 'from-amber-500 to-orange-600 text-amber-100 shadow-amber-500/20';
    return 'from-slate-600 to-slate-700 text-slate-200';
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-950/30">
      {/* Top Banner & Match Score Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={mainImage}
          alt={boarding_place.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30"></div>

        {/* Match Score Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${getScoreColor(match_score)} px-3 py-1.5 text-xs font-black shadow-lg`}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>{match_score.toFixed(1)}% Match</span>
          </div>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(boarding_place.id)}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
              is_favorite ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${is_favorite ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Accommodation Type */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-md bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-sm border border-slate-800">
            {boarding_place.accommodation_type}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-cyan-300">
            {boarding_place.title}
          </h3>
        </div>

        {/* Price & Distance */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-cyan-400">Rs. {boarding_place.price.toLocaleString()}</span>
            <span className="text-xs text-slate-400">/ month</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-800">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            <span>{distance_km} km away</span>
          </div>
        </div>

        {/* Highlight Reason Snippet */}
        {reasons && reasons.length > 0 && (
          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300 line-clamp-1">
            {reasons[0]}
          </div>
        )}

        {/* Key Facilities Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {boarding_place.facilities?.slice(0, 4).map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/50">
              <CheckCircle2 className="h-3 w-3 text-cyan-400" />
              {f.name}
            </span>
          ))}
          {boarding_place.facilities?.length > 4 && (
            <span className="rounded-md bg-slate-800/50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              +{boarding_place.facilities.length - 4} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => onExplainClick(item)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Why Recommended?
          </button>
          <Link
            to={`/boarding/${boarding_place.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};
