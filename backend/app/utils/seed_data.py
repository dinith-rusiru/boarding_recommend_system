from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.models import (
    User, UserRole, StudentProfile, LandlordProfile, BoardingPlace, 
    ListingStatus, Facility, BoardingFacility, BoardingImage, StudentPreference, Favorite, ResearchEvaluation
)
from app.auth.security import get_password_hash

FACILITIES_LIST = [
    {"name": "Wi-Fi", "icon": "Wifi"},
    {"name": "Attached Bathroom", "icon": "Bath"},
    {"name": "Parking", "icon": "Car"},
    {"name": "Kitchen Access", "icon": "Utensils"},
    {"name": "Laundry / Washing Machine", "icon": "Shirt"},
    {"name": "Electricity Included", "icon": "Zap"},
    {"name": "Water Included", "icon": "Droplet"},
    {"name": "Study Table & Chair", "icon": "BookOpen"},
    {"name": "Cupboard / Wardrobe", "icon": "Box"},
    {"name": "Air Conditioning", "icon": "Wind"},
    {"name": "CCTV Security", "icon": "ShieldCheck"},
    {"name": "24/7 Security Guard", "icon": "Lock"},
    {"name": "Meals Provided", "icon": "Coffee"},
    {"name": "Fully Furnished Room", "icon": "Bed"}
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        if db.query(User).filter(User.email == "admin@smartbodim.lk").first():
            print("Database already seeded!")
            return

        print("Seeding Smart Bodim database with realistic demo data...")

        # 1. Seed Facilities
        fac_obj_map = {}
        for f in FACILITIES_LIST:
            fac = Facility(name=f["name"], icon=f["icon"])
            db.add(fac)
            db.flush()
            fac_obj_map[f["name"]] = fac.id

        # 2. Seed Admin User
        admin_user = User(
            name="System Admin",
            email="admin@smartbodim.lk",
            password_hash=get_password_hash("Admin123!"),
            role=UserRole.ADMIN,
            phone="+94 77 123 4567"
        )
        db.add(admin_user)

        # 3. Seed Landlords
        landlord1_user = User(
            name="Mr. Bandara Gunasekara",
            email="bandara.g@gmail.com",
            password_hash=get_password_hash("Landlord123!"),
            role=UserRole.LANDLORD,
            phone="+94 71 888 9900"
        )
        db.add(landlord1_user)
        db.flush()
        landlord1_profile = LandlordProfile(user_id=landlord1_user.id, contact_information="+94 71 888 9900", company_name="Gunasekara Residencies")
        db.add(landlord1_profile)

        landlord2_user = User(
            name="Mrs. Sunethra Perera",
            email="sunethra.p@outlook.com",
            password_hash=get_password_hash("Landlord123!"),
            role=UserRole.LANDLORD,
            phone="+94 77 555 1234"
        )
        db.add(landlord2_user)
        db.flush()
        landlord2_profile = LandlordProfile(user_id=landlord2_user.id, contact_information="+94 77 555 1234", company_name="Perera Boarding Homes")
        db.add(landlord2_profile)

        db.flush()

        # 4. Seed Student Users
        student1_user = User(
            name="Kasun Fernando",
            email="kasun.f@student.lk",
            password_hash=get_password_hash("Student123!"),
            role=UserRole.STUDENT,
            phone="+94 76 333 4444"
        )
        db.add(student1_user)
        db.flush()
        student1_profile = StudentProfile(
            user_id=student1_user.id,
            university="University of Colombo (Reid Avenue)",
            university_latitude=6.9000,
            university_longitude=79.8588,
            budget=22000.0,
            preferred_distance=2.5,
            safety_preference=5,
            study_environment_preference=4,
            accommodation_type="Single Room",
            gender_preference="Male",
            occupants=1
        )
        db.add(student1_profile)
        db.flush()
        db.add(StudentPreference(
            student_id=student1_profile.id,
            budget_weight=35.0,
            distance_weight=25.0,
            facilities_weight=20.0,
            safety_weight=15.0,
            study_environment_weight=5.0
        ))

        # 5. Seed Realistic Boarding Listings (Approved & Pending)
        listings_data = [
            {
                "landlord": landlord1_profile,
                "title": "Green View Luxury Student Boarding - Reid Avenue",
                "description": "Quiet, spacious single bedroom tailored for University of Colombo & IIT students. Features private study desk, fast optical fiber Wi-Fi, air conditioning option, and 24/7 CCTV security.",
                "price": 20000.0,
                "address": "No. 45 Reid Avenue, Colombo 07",
                "latitude": 6.9025,
                "longitude": 79.8605,
                "accommodation_type": "Single Room",
                "occupancy_count": 1,
                "gender_policy": "Male Only",
                "safety_rating": 4.8,
                "study_environment_rating": 4.9,
                "house_rules": "Strict quiet study hours after 10 PM. No smoking inside rooms. Visitors allowed until 8 PM.",
                "contact_phone": "+94 71 888 9900",
                "status": ListingStatus.APPROVED,
                "facilities": ["Wi-Fi", "Attached Bathroom", "Study Table & Chair", "CCTV Security", "Cupboard / Wardrobe", "Electricity Included"],
                "images": [
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "landlord": landlord1_profile,
                "title": "University Hostel & Annex - Moratuwa Katubedda",
                "description": "Just 800m from University of Moratuwa main gate! Fully furnished twin-sharing room with free water, electricity, secure parking, and clean kitchen area.",
                "price": 16000.0,
                "address": "No. 12/B Galle Road, Katubedda, Moratuwa",
                "latitude": 6.7975,
                "longitude": 79.9015,
                "accommodation_type": "Shared Room",
                "occupancy_count": 2,
                "gender_policy": "Any",
                "safety_rating": 4.5,
                "study_environment_rating": 4.2,
                "house_rules": "No alcohol or noisy music. Keep shared kitchen clean after cooking.",
                "contact_phone": "+94 71 888 9900",
                "status": ListingStatus.APPROVED,
                "facilities": ["Wi-Fi", "Kitchen Access", "Parking", "Water Included", "Study Table & Chair"],
                "images": [
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1540518614846-7ede433c5163?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "landlord": landlord2_profile,
                "title": "Sunethra Female Student Residence - Thimbirigasyaya",
                "description": "Safe, family-managed boarding house for female undergrads of UoC and Horizon Campus. Gated compound with security guard, home-cooked meals option, and air-conditioned rooms.",
                "price": 24000.0,
                "address": "No. 88 Thimbirigasyaya Road, Colombo 05",
                "latitude": 6.8920,
                "longitude": 79.8690,
                "accommodation_type": "Single Room",
                "occupancy_count": 1,
                "gender_policy": "Female Only",
                "safety_rating": 4.9,
                "study_environment_rating": 4.7,
                "house_rules": "Gate closes at 9:30 PM. Female guests only.",
                "contact_phone": "+94 77 555 1234",
                "status": ListingStatus.APPROVED,
                "facilities": ["Wi-Fi", "Attached Bathroom", "24/7 Security Guard", "Air Conditioning", "Meals Provided", "Laundry / Washing Machine"],
                "images": [
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "landlord": landlord2_profile,
                "title": "Metro Modern Studio Apartment - Malabe Tech Zone",
                "description": "Modern studio apartment within walking distance to SLIIT Malabe & CINEC. High-speed 100Mbps Wi-Fi, modern kitchenette, desk setup, ideal for software engineering & IT students.",
                "price": 32000.0,
                "address": "Kaduwela Road, Malabe",
                "latitude": 6.9060,
                "longitude": 79.9680,
                "accommodation_type": "Apartment",
                "occupancy_count": 1,
                "gender_policy": "Any",
                "safety_rating": 4.7,
                "study_environment_rating": 4.8,
                "house_rules": "Self-maintained apartment. No loud night parties.",
                "contact_phone": "+94 77 555 1234",
                "status": ListingStatus.APPROVED,
                "facilities": ["Wi-Fi", "Attached Bathroom", "Kitchen Access", "Air Conditioning", "Fully Furnished Room", "Parking"],
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "landlord": landlord1_profile,
                "title": "Budget Student Lodge - Pitipana NSBM Green Campus",
                "description": "Affordable boarding home near NSBM Green University Pitipana. Twin shared room with study desks, solar hot water, and quiet garden atmosphere.",
                "price": 14000.0,
                "address": "Pitipana Road, Homagama",
                "latitude": 6.8210,
                "longitude": 80.0400,
                "accommodation_type": "Shared Room",
                "occupancy_count": 2,
                "gender_policy": "Male Only",
                "safety_rating": 4.3,
                "study_environment_rating": 4.5,
                "house_rules": "Quiet study environment. Keep room tidy.",
                "contact_phone": "+94 71 888 9900",
                "status": ListingStatus.PENDING,
                "facilities": ["Wi-Fi", "Study Table & Chair", "Water Included", "Parking"],
                "images": [
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
                ]
            }
        ]

        for item in listings_data:
            bp = BoardingPlace(
                landlord_id=item["landlord"].id,
                title=item["title"],
                description=item["description"],
                price=item["price"],
                address=item["address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                accommodation_type=item["accommodation_type"],
                occupancy_count=item["occupancy_count"],
                gender_policy=item["gender_policy"],
                safety_rating=item["safety_rating"],
                study_environment_rating=item["study_environment_rating"],
                house_rules=item["house_rules"],
                contact_phone=item["contact_phone"],
                status=item["status"]
            )
            db.add(bp)
            db.flush()

            for fname in item["facilities"]:
                if fname in fac_obj_map:
                    db.add(BoardingFacility(boarding_place_id=bp.id, facility_id=fac_obj_map[fname]))

            for img_url in item["images"]:
                db.add(BoardingImage(boarding_place_id=bp.id, image_url=img_url))

        # 6. Seed Initial Research Evaluation Entry
        db.add(ResearchEvaluation(
            student_id=student1_profile.id,
            search_mode="smart_bodim",
            search_time_seconds=150.0,
            relevance_rating=5,
            satisfaction_rating=5,
            ease_of_use_rating=5,
            perceived_usefulness_rating=5,
            comments="Smart Bodim saved me hours of travelling around Reid Avenue looking for boarding places!"
        ))

        db.commit()
        print("Database successfully seeded with demo accounts & approved listings!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
