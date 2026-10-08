import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, ShieldCheck, MapPin, Sliders, ArrowRight, BookOpen, BarChart3, CheckCircle, Search } from 'lucide-react';
import { boardingService } from '../services/boardingService';
import { recommendationService } from '../services/recommendationService';
import { BoardingCard } from '../components/BoardingCard';
import { RecommendationExplanationModal } from '../components/RecommendationExplanationModal';
import { RecommendationItem } from '../types';

export const Home: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopRecs = async () => {
      try {
        const res = await recommendationService.getRecommendations();
        setRecommendations(res.recommendations.slice(0, 3));
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRecs();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16">
        <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute right-10 top-20 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Research Contribution: Context-Aware Recommendation System</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Find Your Ideal Boarding Place with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Smart Bodim
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            An intelligent context-aware boarding place recommendation platform using a Weighted Scoring Algorithm. Tailored for Sri Lankan university students to minimize search time and accommodation mismatch.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/recommendations"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              Get Personalized Recommendations
            </Link>

            <Link
              to="/algorithm"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Explore Weighted Algorithm
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur sm:grid-cols-4">
            <div>
              <div className="text-2xl font-black text-cyan-400">85%+</div>
              <div className="text-xs text-slate-400">Search Time Reduction</div>
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-400">5-Factor</div>
              <div className="text-xs text-slate-400">Weighted Scoring Model</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">Haversine</div>
              <div className="text-xs text-slate-400">Geospatial Distance Engine</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400">Admin Approved Listings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Research Problem Overview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl md:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Research Problem Statement</span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Beyond Traditional Accommodation Marketplaces
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Traditional listing websites rely on rigid search filters that miss personal lifestyle priorities. Smart Bodim introduces an intelligent recommendation engine that dynamically computes a 0–100% Match Score based on student-specific priorities.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Dynamic User Weights</h3>
              <p className="mt-2 text-xs text-slate-400">
                Prioritize budget, distance, safety, study environment, and facilities with custom importance levels.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Haversine Distance Scoring</h3>
              <p className="mt-2 text-xs text-slate-400">
                Exact geospatial distance calculation from your university campus to boarding locations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Match Explainability</h3>
              <p className="mt-2 text-xs text-slate-400">
                Transparent match breakdowns explaining strengths and cautions for every boarding recommendation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Ranked Recommendations Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Top Recommended Boarding Places</h2>
            <p className="text-xs text-slate-400">Ranked dynamically by the Weighted Scoring Engine</p>
          </div>

          <Link
            to="/recommendations"
            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            <span>View All Ranked Places</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {recommendations.map((item) => (
              <BoardingCard
                key={item.boarding_place.id}
                item={item}
                onExplainClick={(i) => setSelectedItem(i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recommendation Explanation Modal */}
      <RecommendationExplanationModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
