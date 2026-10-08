import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { boardingService } from '../services/boardingService';
import { recommendationService } from '../services/recommendationService';
import { studentService } from '../services/studentService';
import { BoardingPlace, RecommendationItem } from '../types';
import { MapPin, Phone, Mail, Shield, BookOpen, CheckCircle2, Heart, Sparkles, ArrowLeft, Building2 } from 'lucide-react';

export const BoardingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<BoardingPlace | null>(null);
  const [recommendationItem, setRecommendationItem] = useState<RecommendationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const placeData = await boardingService.getDetails(Number(id));
        setPlace(placeData);

        // Fetch recommendation match analysis for this place
        const recRes = await recommendationService.getRecommendations();
        const matchItem = recRes.recommendations.find((r) => r.boarding_place.id === Number(id));
        if (matchItem) {
          setRecommendationItem(matchItem);
          setIsFavorite(matchItem.is_favorite);
        }
      } catch (err) {
        console.error('Failed to load details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!place) return;
    try {
      const res = await studentService.toggleFavorite(place.id);
      setIsFavorite(res.saved);
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Boarding Place Not Found</h2>
        <Link to="/recommendations" className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-cyan-300">
          Back to Recommendations
        </Link>
      </div>
    );
  }

  const images = place.images && place.images.length > 0
    ? place.images.map(i => i.image_url)
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Back Button */}
      <Link to="/recommendations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Ranked Recommendations
      </Link>

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image View */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
            <img
              src={images[activeImageIndex]}
              alt={place.title}
              className="h-[400px] w-full object-cover"
            />
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 rounded-xl bg-slate-950/80 p-2 backdrop-blur">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-12 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                      idx === activeImageIndex ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-black text-white sm:text-3xl">{place.title}</h1>
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                  isFavorite ? 'border-rose-500 bg-rose-500/20 text-rose-300' : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
                {isFavorite ? 'Saved' : 'Save Place'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>{place.address}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>{place.accommodation_type} ({place.occupancy_count} Person)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-3">
            <h3 className="text-base font-bold text-white">Property Description</h3>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{place.description}</p>
          </div>

          {/* Facilities */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-4">
            <h3 className="text-base font-bold text-white">Included Facilities & Amenities</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {place.facilities?.map((f) => (
                <div key={f.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          {place.house_rules && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-2">
              <h3 className="text-base font-bold text-white">House Rules</h3>
              <p className="text-xs leading-relaxed text-slate-300">{place.house_rules}</p>
            </div>
          )}
        </div>

        {/* Right Col: Price, Match Score Breakdown & Landlord Card */}
        <div className="space-y-6">
          {/* Price Box */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Monthly Rent</span>
              <div className="text-3xl font-black text-cyan-400">Rs. {place.price.toLocaleString()}</div>
            </div>

            {/* Landlord Contact Info */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Landlord Contact Information</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">{place.landlord_name}</span>
                </div>
                {place.contact_phone && (
                  <a href={`tel:${place.contact_phone}`} className="flex items-center gap-2 text-cyan-400 hover:underline">
                    <Phone className="h-4 w-4" />
                    <span>{place.contact_phone}</span>
                  </a>
                )}
                {place.landlord_email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span>{place.landlord_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 15 Match Analysis Card */}
          {recommendationItem && (
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Match Analysis</h3>
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {recommendationItem.match_score.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Budget Score', score: recommendationItem.breakdown.budget, color: 'bg-emerald-500' },
                  { label: 'Distance Score', score: recommendationItem.breakdown.distance, color: 'bg-cyan-500' },
                  { label: 'Facilities Score', score: recommendationItem.breakdown.facilities, color: 'bg-indigo-500' },
                  { label: 'Safety Rating', score: recommendationItem.breakdown.safety, color: 'bg-purple-500' },
                  { label: 'Study Environment', score: recommendationItem.breakdown.study_environment, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span>{item.label}</span>
                      <span className="font-bold text-white">{item.score.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full ${item.color}`} style={{ width: `${Math.max(5, item.score)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reasons list */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase">Key Drivers</h4>
                {recommendationItem.reasons.slice(0, 3).map((r, i) => (
                  <div key={i} className="text-xs text-emerald-300 leading-snug">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
