from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import BoardingPlace, ListingStatus, Facility, Favorite, StudentProfile
from app.schemas.schemas import BoardingPlaceResponse, FacilityResponse, BoardingImageResponse
from app.auth.deps import get_optional_current_user

router = APIRouter(prefix="/boarding", tags=["Boarding Listings"])

def serialize_boarding(p: BoardingPlace) -> BoardingPlaceResponse:
    facs = [FacilityResponse.from_orm(bf.facility) for bf in p.facilities if bf.facility]
    imgs = [BoardingImageResponse.from_orm(img) for img in p.images]
    landlord_name = p.landlord.user.name if p.landlord and p.landlord.user else "Landlord"
    landlord_email = p.landlord.user.email if p.landlord and p.landlord.user else None
    
    return BoardingPlaceResponse(
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

@router.get("", response_model=List[BoardingPlaceResponse])
def get_public_listings(
    max_price: Optional[float] = None,
    accommodation_type: Optional[str] = None,
    min_safety: Optional[float] = None,
    db: Session = Depends(get_db)
):
    # Only return APPROVED listings to students & public
    query = db.query(BoardingPlace).filter(BoardingPlace.status == ListingStatus.APPROVED)
    
    if max_price:
        query = query.filter(BoardingPlace.price <= max_price)
    if accommodation_type and accommodation_type != "All":
        query = query.filter(BoardingPlace.accommodation_type == accommodation_type)
    if min_safety:
        query = query.filter(BoardingPlace.safety_rating >= min_safety)

    places = query.order_by(BoardingPlace.created_at.desc()).all()
    return [serialize_boarding(p) for p in places]

@router.get("/{place_id}", response_model=BoardingPlaceResponse)
def get_boarding_details(
    place_id: int,
    db: Session = Depends(get_db)
):
    place = db.query(BoardingPlace).filter(BoardingPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Boarding place not found")
    
    # Increment view count
    place.views_count += 1
    db.commit()
    db.refresh(place)

    return serialize_boarding(place)
