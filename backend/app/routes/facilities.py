from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Facility
from app.schemas.schemas import FacilityResponse

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", response_model=List[FacilityResponse])
def get_facilities(db: Session = Depends(get_db)):
    facs = db.query(Facility).all()
    return [FacilityResponse.from_orm(f) for f in facs]
