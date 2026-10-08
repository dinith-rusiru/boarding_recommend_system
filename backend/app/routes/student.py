from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import (
    StudentProfile, StudentPreference, StudentRequiredFacility, 
    Favorite, BoardingPlace, ListingStatus
)
from app.schemas.schemas import (
    StudentProfileUpdate, StudentProfileResponse, BoardingPlaceResponse,
    FacilityResponse, BoardingImageResponse
)
from app.auth.deps import get_current_student
from app.recommendation.engine import priority_to_raw_weight

router = APIRouter(prefix="/student", tags=["Student Profile & Preferences"])

@router.get("/profile", response_model=StudentProfileResponse)
def get_profile(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Ensure preference weights record exists
    if not student.preference_weights:
        pref = StudentPreference(student_id=student.id)
        db.add(pref)
        db.commit()
        db.refresh(student)

    req_facs = db.query(StudentRequiredFacility).filter(StudentRequiredFacility.student_id == student.id).all()
    req_ids = [rf.facility_id for rf in req_facs]

    weights = student.preference_weights

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        university=student.university or "University of Colombo",
        university_latitude=student.university_latitude or 6.9000,
        university_longitude=student.university_longitude or 79.8588,
        budget=student.budget,
        preferred_distance=student.preferred_distance,
        safety_preference=student.safety_preference,
        study_environment_preference=student.study_environment_preference,
        accommodation_type=student.accommodation_type,
        gender_preference=student.gender_preference,
        occupants=student.occupants,
        required_facility_ids=req_ids,
        budget_weight=weights.budget_weight if weights else 30.0,
        distance_weight=weights.distance_weight if weights else 25.0,
        facilities_weight=weights.facilities_weight if weights else 20.0,
        safety_weight=weights.safety_weight if weights else 15.0,
        study_environment_weight=weights.study_environment_weight if weights else 10.0
    )

@router.put("/profile", response_model=StudentProfileResponse)
def update_profile(
    data: StudentProfileUpdate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if data.university is not None:
        student.university = data.university
    if data.university_latitude is not None:
        student.university_latitude = data.university_latitude
    if data.university_longitude is not None:
        student.university_longitude = data.university_longitude
    if data.budget is not None:
        student.budget = data.budget
    if data.preferred_distance is not None:
        student.preferred_distance = data.preferred_distance
    if data.safety_preference is not None:
        student.safety_preference = data.safety_preference
    if data.study_environment_preference is not None:
        student.study_environment_preference = data.study_environment_preference
    if data.accommodation_type is not None:
        student.accommodation_type = data.accommodation_type
    if data.gender_preference is not None:
        student.gender_preference = data.gender_preference
    if data.occupants is not None:
        student.occupants = data.occupants

    # Update required facilities
    if data.required_facility_ids is not None:
        db.query(StudentRequiredFacility).filter(StudentRequiredFacility.student_id == student.id).delete()
        for fid in data.required_facility_ids:
            db.add(StudentRequiredFacility(student_id=student.id, facility_id=fid))

    # Update dynamic priority weights if provided
    pref = student.preference_weights
    if not pref:
        pref = StudentPreference(student_id=student.id)
        db.add(pref)

    if data.weights:
        pref.budget_weight = priority_to_raw_weight(data.weights.budget_priority)
        pref.distance_weight = priority_to_raw_weight(data.weights.distance_priority)
        pref.facilities_weight = priority_to_raw_weight(data.weights.facilities_priority)
        pref.safety_weight = priority_to_raw_weight(data.weights.safety_priority)
        pref.study_environment_weight = priority_to_raw_weight(data.weights.study_environment_priority)

    db.commit()
    db.refresh(student)
    return get_profile(student=student, db=db)

@router.get("/favorites", response_model=List[BoardingPlaceResponse])
def get_favorites(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite).filter(Favorite.student_id == student.id).all()
    fav_place_ids = [f.boarding_place_id for f in favs]
    
    places = db.query(BoardingPlace).filter(BoardingPlace.id.in_(fav_place_ids)).all()
    
    results = []
    for p in places:
        facs = [FacilityResponse.from_orm(bf.facility) for bf in p.facilities if bf.facility]
        imgs = [BoardingImageResponse.from_orm(img) for img in p.images]
        landlord_name = p.landlord.user.name if p.landlord and p.landlord.user else "Landlord"
        landlord_email = p.landlord.user.email if p.landlord and p.landlord.user else None
        
        results.append(
            BoardingPlaceResponse(
                id=p.id,
                landlord_id=p.landlord_id,
                title=p.title,
                description=p.description,
                price=p.price,
                address=p.address,
                latitude=p.latitude,
                longitude=p.longitude,
                accommodation_type=p.accommodation_type,
                occupancy_count=p.occupancy_count,
                gender_policy=p.gender_policy,
                safety_rating=p.safety_rating,
                study_environment_rating=p.study_environment_rating,
                house_rules=p.house_rules,
                contact_phone=p.contact_phone,
                status=p.status,
                views_count=p.views_count,
                created_at=p.created_at,
                facilities=facs,
                images=imgs,
                landlord_name=landlord_name,
                landlord_email=landlord_email
            )
        )
    return results

@router.post("/favorites/{boarding_place_id}")
def toggle_favorite(
    boarding_place_id: int,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    place = db.query(BoardingPlace).filter(BoardingPlace.id == boarding_place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Boarding place not found")

    existing = db.query(Favorite).filter(
        Favorite.student_id == student.id,
        Favorite.boarding_place_id == boarding_place_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Removed from favorites"}
    else:
        new_fav = Favorite(student_id=student.id, boarding_place_id=boarding_place_id)
        db.add(new_fav)
        db.commit()
        return {"saved": True, "message": "Saved to favorites"}
