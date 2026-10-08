from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("student", pattern="^(student|landlord|admin)$")
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# --- Student Profile & Preference Schemas ---
class StudentPreferenceWeightInput(BaseModel):
    budget_priority: str = Field("Very Important", pattern="^(Very Important|Important|Normal|Low)$")
    distance_priority: str = Field("Important", pattern="^(Very Important|Important|Normal|Low)$")
    facilities_priority: str = Field("Normal", pattern="^(Very Important|Important|Normal|Low)$")
    safety_priority: str = Field("Very Important", pattern="^(Very Important|Important|Normal|Low)$")
    study_environment_priority: str = Field("Normal", pattern="^(Very Important|Important|Normal|Low)$")

class StudentProfileUpdate(BaseModel):
    university: Optional[str] = "University of Colombo"
    university_latitude: Optional[float] = 6.9000
    university_longitude: Optional[float] = 79.8588
    budget: Optional[float] = Field(25000.0, ge=0)
    preferred_distance: Optional[float] = Field(3.0, ge=0)
    safety_preference: Optional[int] = Field(4, ge=1, le=5)
    study_environment_preference: Optional[int] = Field(4, ge=1, le=5)
    accommodation_type: Optional[str] = "Single Room"
    gender_preference: Optional[str] = "Any"
    occupants: Optional[int] = Field(1, ge=1)
    required_facility_ids: Optional[List[int]] = []
    
    # Priority selection convertable to weights
    weights: Optional[StudentPreferenceWeightInput] = None

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    university: str
    university_latitude: float
    university_longitude: float
    budget: float
    preferred_distance: float
    safety_preference: int
    study_environment_preference: int
    accommodation_type: str
    gender_preference: str
    occupants: int
    required_facility_ids: List[int] = []
    budget_weight: float = 30.0
    distance_weight: float = 25.0
    facilities_weight: float = 20.0
    safety_weight: float = 15.0
    study_environment_weight: float = 10.0

    class Config:
        from_attributes = True


# --- Facilities & Images ---
class FacilityResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = "CheckCircle"

    class Config:
        from_attributes = True

class BoardingImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True


# --- Boarding Place Schemas ---
class BoardingPlaceCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    price: float = Field(..., ge=0)
    address: str = Field(...)
    latitude: float
    longitude: float
    accommodation_type: str = "Single Room"
    occupancy_count: int = Field(1, ge=1)
    gender_policy: str = "Any"
    safety_rating: float = Field(4.0, ge=1.0, le=5.0)
    study_environment_rating: float = Field(4.0, ge=1.0, le=5.0)
    house_rules: Optional[str] = None
    contact_phone: Optional[str] = None
    facility_ids: List[int] = []
    image_urls: List[str] = []

class BoardingPlaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accommodation_type: Optional[str] = None
    occupancy_count: Optional[int] = Field(None, ge=1)
    gender_policy: Optional[str] = None
    safety_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    study_environment_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    house_rules: Optional[str] = None
    contact_phone: Optional[str] = None
    facility_ids: Optional[List[int]] = None
    image_urls: Optional[List[str]] = None
    status: Optional[str] = None

class BoardingPlaceResponse(BaseModel):
    id: int
    landlord_id: int
    title: str
    description: str
    price: float
    address: str
    latitude: float
    longitude: float
    accommodation_type: str
    occupancy_count: int
    gender_policy: str
    safety_rating: float
    study_environment_rating: float
    house_rules: Optional[str] = None
    contact_phone: Optional[str] = None
    status: str
    views_count: int
    created_at: datetime
    facilities: List[FacilityResponse] = []
    images: List[BoardingImageResponse] = []
    landlord_name: Optional[str] = None
    landlord_email: Optional[str] = None

    class Config:
        from_attributes = True


# --- Recommendation Schemas ---
class CriterionBreakdown(BaseModel):
    budget: float
    distance: float
    facilities: float
    safety: float
    study_environment: float

class CriterionWeights(BaseModel):
    budget: float
    distance: float
    facilities: float
    safety: float
    study_environment: float

class RecommendationItem(BaseModel):
    boarding_place: BoardingPlaceResponse
    match_score: float
    distance_km: float
    breakdown: CriterionBreakdown
    weights: CriterionWeights
    reasons: List[str]
    weaknesses: List[str]
    is_favorite: bool = False

class RecommendationListResponse(BaseModel):
    student_profile: Optional[StudentProfileResponse] = None
    total_listings_evaluated: int
    recommendations: List[RecommendationItem]
    cold_start: bool = False
    message: Optional[str] = None


# --- Research Evaluation Schemas ---
class EvaluationCreate(BaseModel):
    search_mode: str = Field("smart_bodim", pattern="^(traditional|smart_bodim)$")
    search_time_seconds: float = Field(..., ge=0)
    relevance_rating: int = Field(..., ge=1, le=5)
    satisfaction_rating: int = Field(..., ge=1, le=5)
    ease_of_use_rating: int = Field(..., ge=1, le=5)
    perceived_usefulness_rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class EvaluationResponse(BaseModel):
    id: int
    student_id: int
    search_mode: str
    search_time_seconds: float
    relevance_rating: int
    satisfaction_rating: int
    ease_of_use_rating: int
    perceived_usefulness_rating: int
    comments: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluationStatsResponse(BaseModel):
    total_evaluations: int
    avg_traditional_search_time_sec: float
    avg_smart_bodim_search_time_sec: float
    avg_relevance_rating: float
    avg_satisfaction_rating: float
    avg_ease_of_use_rating: float
    avg_perceived_usefulness_rating: float
    time_saved_percentage: float
