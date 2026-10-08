from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import BoardingPlace, ListingStatus, Facility, Favorite, StudentProfile, RecommendationLog
from app.schemas.schemas import RecommendationListResponse, RecommendationItem, CriterionBreakdown, CriterionWeights, StudentProfileResponse
from app.auth.deps import get_optional_current_user
from app.recommendation.engine import calculate_recommendation
from app.routes.boarding import serialize_boarding

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])

@router.get("", response_model=RecommendationListResponse)
def get_recommendations(
    university_lat: Optional[float] = Query(None, description="Custom university latitude for testing/search"),
    university_lng: Optional[float] = Query(None, description="Custom university longitude for testing/search"),
    max_budget: Optional[float] = Query(None, description="Custom max budget for testing/search"),
    max_distance: Optional[float] = Query(None, description="Custom max distance for testing/search"),
    current_user = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    student_profile = None
    if current_user and current_user.role == "student":
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    cold_start = False
    message = None

    # Handle Cold Start or Guest mode
    if not student_profile:
        cold_start = True
        message = "Complete your preference profile to receive context-aware personalized recommendations."
        # Dummy profile for calculation fallback
        class DummyProfile:
            university_latitude = university_lat if university_lat is not None else 6.9000
            university_longitude = university_lng if university_lng is not None else 79.8588
            budget = max_budget if max_budget is not None else 25000.0
            preferred_distance = max_distance if max_distance is not None else 3.0
            safety_preference = 4
            study_environment_preference = 4
            required_facilities = []
        student_profile = DummyProfile()
    else:
        # Override with query params if explicitly supplied in UI filters
        if university_lat is not None:
            student_profile.university_latitude = university_lat
        if university_lng is not None:
            student_profile.university_longitude = university_lng
        if max_budget is not None:
            student_profile.budget = max_budget
        if max_distance is not None:
            student_profile.preferred_distance = max_distance

    # Get student weights
    raw_weights = {
        "budget": 30.0,
        "distance": 25.0,
        "facilities": 20.0,
        "safety": 15.0,
        "study_environment": 10.0
    }
    if hasattr(student_profile, "preference_weights") and student_profile.preference_weights:
        w = student_profile.preference_weights
        raw_weights = {
            "budget": w.budget_weight,
            "distance": w.distance_weight,
            "facilities": w.facilities_weight,
            "safety": w.safety_weight,
            "study_environment": w.study_environment_weight
        }

    # Fetch facility map for explainability
    all_facilities = db.query(Facility).all()
    facility_map = {f.id: f.name for f in all_facilities}

    # Fetch student favorites list for badge status
    favorite_place_ids = set()
    if hasattr(student_profile, "id"):
        favs = db.query(Favorite).filter(Favorite.student_id == student_profile.id).all()
        favorite_place_ids = {f.boarding_place_id for f in favs}

    # Retrieve ONLY APPROVED listings from database
    approved_places = db.query(BoardingPlace).filter(BoardingPlace.status == ListingStatus.APPROVED).all()

    recommendation_results = []

    for place in approved_places:
        rec = calculate_recommendation(
            boarding_place=place,
            student_profile=student_profile,
            raw_weights=raw_weights,
            facility_map=facility_map
        )
        
        serialized_place = serialize_boarding(place)
        is_fav = place.id in favorite_place_ids

        # Optionally log calculation in database if student is logged in
        if hasattr(student_profile, "id") and student_profile.id:
            try:
                log_entry = RecommendationLog(
                    student_id=student_profile.id,
                    boarding_place_id=place.id,
                    match_score=rec["match_score"],
                    budget_score=rec["breakdown"]["budget"],
                    distance_score=rec["breakdown"]["distance"],
                    facility_score=rec["breakdown"]["facilities"],
                    safety_score=rec["breakdown"]["safety"],
                    study_environment_score=rec["breakdown"]["study_environment"]
                )
                db.add(log_entry)
            except Exception:
                pass # Non-blocking log write

        recommendation_results.append(
            RecommendationItem(
                boarding_place=serialized_place,
                match_score=rec["match_score"],
                distance_km=rec["distance_km"],
                breakdown=CriterionBreakdown(**rec["breakdown"]),
                weights=CriterionWeights(**rec["weights"]),
                reasons=rec["reasons"],
                weaknesses=rec["weaknesses"],
                is_favorite=is_fav
            )
        )

    try:
        db.commit()
    except Exception:
        db.rollback()

    # Sort descending by Match Score
    recommendation_results.sort(key=lambda x: x.match_score, reverse=True)

    student_resp = None
    if hasattr(student_profile, "id") and student_profile.id:
        req_facs = db.query(StudentProfile).filter(StudentProfile.id == student_profile.id).first()
        if req_facs:
            req_ids = [rf.facility_id for rf in req_facs.required_facilities]
            student_resp = StudentProfileResponse(
                id=student_profile.id,
                user_id=student_profile.user_id,
                university=student_profile.university,
                university_latitude=student_profile.university_latitude,
                university_longitude=student_profile.university_longitude,
                budget=student_profile.budget,
                preferred_distance=student_profile.preferred_distance,
                safety_preference=student_profile.safety_preference,
                study_environment_preference=student_profile.study_environment_preference,
                accommodation_type=student_profile.accommodation_type,
                gender_preference=student_profile.gender_preference,
                occupants=student_profile.occupants,
                required_facility_ids=req_ids,
                budget_weight=raw_weights["budget"],
                distance_weight=raw_weights["distance"],
                facilities_weight=raw_weights["facilities"],
                safety_weight=raw_weights["safety"],
                study_environment_weight=raw_weights["study_environment"]
            )

    return RecommendationListResponse(
        student_profile=student_resp,
        total_listings_evaluated=len(approved_places),
        recommendations=recommendation_results,
        cold_start=cold_start,
        message=message
    )
