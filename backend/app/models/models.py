from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    LANDLORD = "landlord"
    ADMIN = "admin"

class ListingStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.STUDENT)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    landlord_profile = relationship("LandlordProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String(150), nullable=True, default="University of Colombo")
    university_latitude = Column(Float, nullable=True, default=6.9000)
    university_longitude = Column(Float, nullable=True, default=79.8588)
    budget = Column(Float, nullable=False, default=25000.0)
    preferred_distance = Column(Float, nullable=False, default=3.0)  # in km
    safety_preference = Column(Integer, nullable=False, default=4)   # 1 to 5 scale
    study_environment_preference = Column(Integer, nullable=False, default=4) # 1 to 5 scale
    accommodation_type = Column(String(50), nullable=False, default="Single Room") # Single Room, Shared Room, Annex, Apartment
    gender_preference = Column(String(20), nullable=False, default="Any") # Male, Female, Any
    occupants = Column(Integer, nullable=False, default=1)

    user = relationship("User", back_populates="student_profile")
    preference_weights = relationship("StudentPreference", back_populates="student", uselist=False, cascade="all, delete-orphan")
    required_facilities = relationship("StudentRequiredFacility", back_populates="student", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="student", cascade="all, delete-orphan")
    recommendation_history = relationship("RecommendationLog", back_populates="student", cascade="all, delete-orphan")
    evaluations = relationship("ResearchEvaluation", back_populates="student", cascade="all, delete-orphan")

class StudentPreference(Base):
    __tablename__ = "student_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Raw priority weight levels (e.g. 35, 25, 20, 15, 5 or priority strings)
    budget_weight = Column(Float, nullable=False, default=30.0)
    distance_weight = Column(Float, nullable=False, default=25.0)
    facilities_weight = Column(Float, nullable=False, default=20.0)
    safety_weight = Column(Float, nullable=False, default=15.0)
    study_environment_weight = Column(Float, nullable=False, default=10.0)

    student = relationship("StudentProfile", back_populates="preference_weights")

class StudentRequiredFacility(Base):
    __tablename__ = "student_required_facilities"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)

    student = relationship("StudentProfile", back_populates="required_facilities")
    facility = relationship("Facility")

class LandlordProfile(Base):
    __tablename__ = "landlords"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    contact_information = Column(Text, nullable=True)
    company_name = Column(String(100), nullable=True)

    user = relationship("User", back_populates="landlord_profile")
    boarding_places = relationship("BoardingPlace", back_populates="landlord", cascade="all, delete-orphan")

class BoardingPlace(Base):
    __tablename__ = "boarding_places"

    id = Column(Integer, primary_key=True, index=True)
    landlord_id = Column(Integer, ForeignKey("landlords.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accommodation_type = Column(String(50), nullable=False, default="Single Room")
    occupancy_count = Column(Integer, nullable=False, default=1)
    gender_policy = Column(String(20), nullable=False, default="Any") # Any, Male Only, Female Only
    safety_rating = Column(Float, nullable=False, default=4.0)          # 1.0 to 5.0 scale
    study_environment_rating = Column(Float, nullable=False, default=4.0) # 1.0 to 5.0 scale
    house_rules = Column(Text, nullable=True)
    contact_phone = Column(String(30), nullable=True)
    status = Column(String(20), nullable=False, default=ListingStatus.PENDING)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    landlord = relationship("LandlordProfile", back_populates="boarding_places")
    facilities = relationship("BoardingFacility", back_populates="boarding_place", cascade="all, delete-orphan")
    images = relationship("BoardingImage", back_populates="boarding_place", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="boarding_place", cascade="all, delete-orphan")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(50), nullable=True, default="CheckCircle")

class BoardingFacility(Base):
    __tablename__ = "boarding_facilities"

    id = Column(Integer, primary_key=True, index=True)
    boarding_place_id = Column(Integer, ForeignKey("boarding_places.id", ondelete="CASCADE"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)

    boarding_place = relationship("BoardingPlace", back_populates="facilities")
    facility = relationship("Facility")

class BoardingImage(Base):
    __tablename__ = "boarding_images"

    id = Column(Integer, primary_key=True, index=True)
    boarding_place_id = Column(Integer, ForeignKey("boarding_places.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text, nullable=False)

    boarding_place = relationship("BoardingPlace", back_populates="images")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    boarding_place_id = Column(Integer, ForeignKey("boarding_places.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("StudentProfile", back_populates="favorites")
    boarding_place = relationship("BoardingPlace", back_populates="favorites")

class RecommendationLog(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    boarding_place_id = Column(Integer, ForeignKey("boarding_places.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)
    budget_score = Column(Float, nullable=False)
    distance_score = Column(Float, nullable=False)
    facility_score = Column(Float, nullable=False)
    safety_score = Column(Float, nullable=False)
    study_environment_score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("StudentProfile", back_populates="recommendation_history")
    boarding_place = relationship("BoardingPlace")

class ResearchEvaluation(Base):
    __tablename__ = "research_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    search_mode = Column(String(30), nullable=False) # "traditional" or "smart_bodim"
    search_time_seconds = Column(Float, nullable=False)
    relevance_rating = Column(Integer, nullable=False) # 1 to 5 Likert scale
    satisfaction_rating = Column(Integer, nullable=False) # 1 to 5 Likert scale
    ease_of_use_rating = Column(Integer, nullable=False) # 1 to 5 Likert scale
    perceived_usefulness_rating = Column(Integer, nullable=False) # 1 to 5 Likert scale
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("StudentProfile", back_populates="evaluations")
