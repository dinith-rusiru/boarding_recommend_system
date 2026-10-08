from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, StudentProfile, LandlordProfile, StudentPreference, UserRole
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    # Hash password
    hashed_pwd = get_password_hash(user_in.password)
    
    # Create user record
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pwd,
        role=user_in.role,
        phone=user_in.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create associated profile role record
    if new_user.role == UserRole.STUDENT:
        profile = StudentProfile(user_id=new_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Create default preference weights
        pref = StudentPreference(student_id=profile.id)
        db.add(pref)
        db.commit()
    elif new_user.role == UserRole.LANDLORD:
        landlord = LandlordProfile(user_id=new_user.id, contact_information=user_in.phone)
        db.add(landlord)
        db.commit()

    # Generate JWT token
    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id, role=user.role)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)
