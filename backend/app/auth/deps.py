from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import decode_token
from app.models.models import User, UserRole, StudentProfile, LandlordProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token not found",
        )
    return user

def get_optional_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None

def require_role(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user.role}' is not authorized to perform this action",
            )
        return user
    return role_checker

def get_current_student(user: User = Depends(require_role([UserRole.STUDENT])), db: Session = Depends(get_db)) -> StudentProfile:
    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student:
        # Auto-create empty student profile if missing
        student = StudentProfile(user_id=user.id)
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

def get_current_landlord(user: User = Depends(require_role([UserRole.LANDLORD])), db: Session = Depends(get_db)) -> LandlordProfile:
    landlord = db.query(LandlordProfile).filter(LandlordProfile.user_id == user.id).first()
    if not landlord:
        # Auto-create landlord profile if missing
        landlord = LandlordProfile(user_id=user.id)
        db.add(landlord)
        db.commit()
        db.refresh(landlord)
    return landlord

def get_current_admin(user: User = Depends(require_role([UserRole.ADMIN]))) -> User:
    return user
