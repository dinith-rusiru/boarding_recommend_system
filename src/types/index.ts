export type UserRole = 'student' | 'landlord' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Facility {
  id: number;
  name: string;
  icon?: string;
}

export interface BoardingImage {
  id: number;
  image_url: string;
}

export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BoardingPlace {
  id: number;
  landlord_id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
  accommodation_type: string;
  occupancy_count: number;
  gender_policy: string;
  safety_rating: number;
  study_environment_rating: number;
  house_rules?: string;
  contact_phone?: string;
  status: ListingStatus;
  views_count: number;
  created_at: string;
  facilities: Facility[];
  images: BoardingImage[];
  landlord_name?: string;
  landlord_email?: string;
  favorites_count?: number;
}

export type PriorityLevel = 'Very Important' | 'Important' | 'Normal' | 'Low';

export interface WeightPriorityInput {
  budget_priority: PriorityLevel;
  distance_priority: PriorityLevel;
  facilities_priority: PriorityLevel;
  safety_priority: PriorityLevel;
  study_environment_priority: PriorityLevel;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  university: string;
  university_latitude: number;
  university_longitude: number;
  budget: number;
  preferred_distance: number;
  safety_preference: number;
  study_environment_preference: number;
  accommodation_type: string;
  gender_preference: string;
  occupants: number;
  required_facility_ids: number[];
  budget_weight: number;
  distance_weight: number;
  facilities_weight: number;
  safety_weight: number;
  study_environment_weight: number;
}

export interface CriterionBreakdown {
  budget: number;
  distance: number;
  facilities: number;
  safety: number;
  study_environment: number;
}

export interface CriterionWeights {
  budget: number;
  distance: number;
  facilities: number;
  safety: number;
  study_environment: number;
}

export interface RecommendationItem {
  boarding_place: BoardingPlace;
  match_score: number;
  distance_km: number;
  breakdown: CriterionBreakdown;
  weights: CriterionWeights;
  reasons: string[];
  weaknesses: string[];
  is_favorite: boolean;
}

export interface RecommendationListResponse {
  student_profile?: StudentProfile;
  total_listings_evaluated: number;
  recommendations: RecommendationItem[];
  cold_start: boolean;
  message?: string;
}

export interface EvaluationInput {
  search_mode: 'traditional' | 'smart_bodim';
  search_time_seconds: number;
  relevance_rating: number;
  satisfaction_rating: number;
  ease_of_use_rating: number;
  perceived_usefulness_rating: number;
  comments?: string;
}

export interface EvaluationStats {
  total_evaluations: number;
  avg_traditional_search_time_sec: number;
  avg_smart_bodim_search_time_sec: number;
  avg_relevance_rating: number;
  avg_satisfaction_rating: number;
  avg_ease_of_use_rating: number;
  avg_perceived_usefulness_rating: number;
  time_saved_percentage: number;
}
