from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import User, UserRole, StudentProfile, LandlordProfile, BoardingPlace, ListingStatus, RecommendationLog
from app.schemas.schemas import BoardingPlaceResponse, UserResponse
from app.auth.deps import get_current_admin
from app.routes.boarding import serialize_boarding

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & Approvals"])

@router.get("/dashboard")
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_landlords = db.query(User).filter(User.role == UserRole.LANDLORD).count()
    total_places = db.query(BoardingPlace).count()
    pending_approvals = db.query(BoardingPlace).filter(BoardingPlace.status == ListingStatus.PENDING).count()
    active_listings = db.query(BoardingPlace).filter(BoardingPlace.status == ListingStatus.APPROVED).count()
    rejected_listings = db.query(BoardingPlace).filter(BoardingPlace.status == ListingStatus.REJECTED).count()
    total_recommendations = db.query(RecommendationLog).count()

    return {
        "total_students": total_students,
        "total_landlords": total_landlords,
        "total_boarding_places": total_places,
        "pending_approvals": pending_approvals,
        "active_listings": active_listings,
        "rejected_listings": rejected_listings,
        "total_recommendations_computed": total_recommendations
    }

@router.get("/listings", response_model=List[BoardingPlaceResponse])
def get_admin_listings(
    status_filter: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(BoardingPlace)
    if status_filter:
        query = query.filter(BoardingPlace.status == status_filter)
    
    places = query.order_by(BoardingPlace.created_at.desc()).all()
    return [serialize_boarding(p) for p in places]

@router.put("/listings/{place_id}/status")
def update_listing_approval_status(
    place_id: int,
    status: str, # "APPROVED" or "REJECTED" or "PENDING"
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if status not in [ListingStatus.APPROVED, ListingStatus.PENDING, ListingStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid listing status")

    place = db.query(BoardingPlace).filter(BoardingPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Boarding place not found")

    place.status = status
    db.commit()
    db.refresh(place)
    return {"message": f"Listing #{place.id} status updated to {status}", "place": serialize_boarding(place)}

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).all()
    return [UserResponse.from_orm(u) for u in users]
