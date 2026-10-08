from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import LandlordProfile, BoardingPlace, BoardingFacility, BoardingImage, Favorite, ListingStatus
from app.schemas.schemas import BoardingPlaceCreate, BoardingPlaceUpdate, BoardingPlaceResponse, FacilityResponse, BoardingImageResponse
from app.auth.deps import get_current_landlord

router = APIRouter(prefix="/landlord", tags=["Landlord Management"])

def serialize_landlord_boarding(p: BoardingPlace, db: Session) -> dict:
    facs = [FacilityResponse.from_orm(bf.facility) for bf in p.facilities if bf.facility]
    imgs = [BoardingImageResponse.from_orm(img) for img in p.images]
    fav_count = db.query(Favorite).filter(Favorite.boarding_place_id == p.id).count()
    
    landlord_name = p.landlord.user.name if p.landlord and p.landlord.user else "Landlord"
    landlord_email = p.landlord.user.email if p.landlord and p.landlord.user else None

    res = BoardingPlaceResponse(
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
    ).dict()
    
    res["favorites_count"] = fav_count
    return res

@router.get("/listings")
def get_landlord_listings(
    landlord: LandlordProfile = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    places = db.query(BoardingPlace).filter(BoardingPlace.landlord_id == landlord.id).order_by(BoardingPlace.created_at.desc()).all()
    return [serialize_landlord_boarding(p, db) for p in places]

@router.post("/listings", status_code=status.HTTP_201_CREATED)
def create_listing(
    data: BoardingPlaceCreate,
    landlord: LandlordProfile = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    # Default status for new listing is PENDING until admin approves
    place = BoardingPlace(
        landlord_id=landlord.id,
        title=data.title,
        description=data.description,
        price=data.price,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        accommodation_type=data.accommodation_type,
        occupancy_count=data.occupancy_count,
        gender_policy=data.gender_policy,
        safety_rating=data.safety_rating,
        study_environment_rating=data.study_environment_rating,
        house_rules=data.house_rules,
        contact_phone=data.contact_phone or landlord.user.phone,
        status=ListingStatus.PENDING
    )
    db.add(place)
    db.commit()
    db.refresh(place)

    # Attach facilities
    for fid in data.facility_ids:
        db.add(BoardingFacility(boarding_place_id=place.id, facility_id=fid))

    # Attach images
    for img_url in data.image_urls:
        if img_url.strip():
            db.add(BoardingImage(boarding_place_id=place.id, image_url=img_url.strip()))

    db.commit()
    db.refresh(place)
    return serialize_landlord_boarding(place, db)

@router.put("/listings/{place_id}")
def update_listing(
    place_id: int,
    data: BoardingPlaceUpdate,
    landlord: LandlordProfile = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    place = db.query(BoardingPlace).filter(
        BoardingPlace.id == place_id,
        BoardingPlace.landlord_id == landlord.id
    ).first()

    if not place:
        raise HTTPException(status_code=404, detail="Boarding place not found or access denied")

    for field, val in data.dict(exclude_unset=True).items():
        if field in ["facility_ids", "image_urls"]:
            continue
        if val is not None:
            setattr(place, field, val)

    if data.facility_ids is not None:
        db.query(BoardingFacility).filter(BoardingFacility.boarding_place_id == place.id).delete()
        for fid in data.facility_ids:
            db.add(BoardingFacility(boarding_place_id=place.id, facility_id=fid))

    if data.image_urls is not None:
        db.query(BoardingImage).filter(BoardingImage.boarding_place_id == place.id).delete()
        for img_url in data.image_urls:
            if img_url.strip():
                db.add(BoardingImage(boarding_place_id=place.id, image_url=img_url.strip()))

    db.commit()
    db.refresh(place)
    return serialize_landlord_boarding(place, db)

@router.delete("/listings/{place_id}")
def delete_listing(
    place_id: int,
    landlord: LandlordProfile = Depends(get_current_landlord),
    db: Session = Depends(get_db)
):
    place = db.query(BoardingPlace).filter(
        BoardingPlace.id == place_id,
        BoardingPlace.landlord_id == landlord.id
    ).first()

    if not place:
        raise HTTPException(status_code=404, detail="Boarding place not found or access denied")

    db.delete(place)
    db.commit()
    return {"message": "Listing deleted successfully"}
