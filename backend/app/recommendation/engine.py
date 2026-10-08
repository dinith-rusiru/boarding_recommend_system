import math
from typing import List, Dict, Tuple, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great circle distance between two points on the earth in kilometers
    using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = R * c
    return round(distance, 2)

def calculate_budget_score(price: float, max_budget: float) -> float:
    """
    Calculates normalized budget score (0 to 100).
    If price <= max_budget: score ranges 85 to 100 based on savings.
    If price > max_budget: score decays based on excess price percentage.
    """
    if max_budget <= 0:
        return 50.0
    
    if price <= max_budget:
        # Savings bonus: up to 100 if significantly below budget
        savings_ratio = (max_budget - price) / max_budget
        score = 85.0 + (15.0 * savings_ratio)
    else:
        # Exponential decay for exceeding budget
        excess_ratio = (price - max_budget) / max_budget
        score = 85.0 * math.exp(-2.0 * excess_ratio)
        
    return round(max(0.0, min(100.0, score)), 1)

def calculate_distance_score(distance_km: float, preferred_distance_km: float) -> float:
    """
    Calculates normalized distance score (0 to 100).
    If distance <= preferred: score ranges 85 to 100.
    If distance > preferred: decay score based on extra distance.
    """
    if preferred_distance_km <= 0:
        preferred_distance_km = 3.0

    if distance_km <= preferred_distance_km:
        # Closer than preferred gives score 85 to 100
        ratio = distance_km / preferred_distance_km
        score = 100.0 - (15.0 * ratio)
    else:
        # Exponential decay for distance exceeding preference
        extra_ratio = (distance_km - preferred_distance_km) / preferred_distance_km
        score = 85.0 * math.exp(-0.8 * extra_ratio)

    return round(max(0.0, min(100.0, score)), 1)

def calculate_facility_score(boarding_facility_ids: List[int], required_facility_ids: List[int], total_facility_count: int = 10) -> float:
    """
    Calculates normalized facility match score (0 to 100).
    If required facilities specified: (Matched / Required) * 100.
    Otherwise proportional to overall facilities available.
    """
    if not required_facility_ids:
        # Default proportional score if no specific required list
        count = len(boarding_facility_ids)
        score = min(100.0, (count / max(1, total_facility_count)) * 100.0 + 30.0)
        return round(score, 1)

    matched = set(boarding_facility_ids).intersection(set(required_facility_ids))
    ratio = len(matched) / len(required_facility_ids)
    score = ratio * 100.0
    return round(max(0.0, min(100.0, score)), 1)

def calculate_rating_score(landlord_rating: float, student_preference_level: int) -> float:
    """
    Calculates normalized safety/study score (0 to 100) on 1-5 rating scale.
    """
    # Base percentage from rating 1-5 scale
    base_score = (landlord_rating / 5.0) * 100.0

    # Small adjustment based on student minimum preference expectations
    target = (student_preference_level / 5.0) * 100.0
    if base_score >= target:
        score = min(100.0, base_score + 5.0)
    else:
        deficit = target - base_score
        score = max(0.0, base_score - (deficit * 0.5))

    return round(score, 1)

def priority_to_raw_weight(priority: str) -> float:
    mapping = {
        "Very Important": 35.0,
        "Important": 25.0,
        "Normal": 15.0,
        "Low": 5.0
    }
    return mapping.get(priority, 20.0)

def normalize_weights(raw_weights: Dict[str, float]) -> Dict[str, float]:
    """
    Normalizes a dictionary of weights so that their sum equals 1.0 (100%).
    """
    total = sum(raw_weights.values())
    if total <= 0:
        return {k: 0.2 for k in raw_weights}
    return {k: round(v / total, 4) for k, v in raw_weights.items()}

def generate_recommendation_explainability(
    boarding_place: Any,
    student_profile: Any,
    distance_km: float,
    scores: Dict[str, float],
    matched_facility_names: List[str]
) -> Tuple[List[str], List[str]]:
    """
    Generates human-readable explanations (strengths/reasons and weaknesses/cautions)
    for why a place was recommended to the student.
    """
    reasons = []
    weaknesses = []

    # Budget reasoning
    if boarding_place.price <= student_profile.budget:
        savings = student_profile.budget - boarding_place.price
        if savings > 0:
            reasons.append(f"✓ Within your budget (Save Rs. {savings:,.0f}/month)")
        else:
            reasons.append("✓ Exactly meets your maximum budget")
    else:
        excess = boarding_place.price - student_profile.budget
        weaknesses.append(f"⚠️ Exceeds your target budget by Rs. {excess:,.0f}/month")

    # Distance reasoning
    if distance_km <= student_profile.preferred_distance:
        reasons.append(f"✓ Conveniently close ({distance_km} km from university)")
    else:
        extra = round(distance_km - student_profile.preferred_distance, 1)
        weaknesses.append(f"⚠️ {distance_km} km away ({extra} km farther than preferred)")

    # Safety reasoning
    if boarding_place.safety_rating >= 4.5:
        reasons.append(f"✓ Exceptional safety rating ({boarding_place.safety_rating}/5.0)")
    elif boarding_place.safety_rating >= 4.0:
        reasons.append(f"✓ High safety rating ({boarding_place.safety_rating}/5.0)")
    elif boarding_place.safety_rating < 3.5:
        weaknesses.append(f"⚠️ Moderate safety rating ({boarding_place.safety_rating}/5.0)")

    # Study environment reasoning
    if boarding_place.study_environment_rating >= 4.5:
        reasons.append("✓ Outstanding quiet study environment")
    elif boarding_place.study_environment_rating >= 4.0:
        reasons.append("✓ Good study environment for learning")
    elif boarding_place.study_environment_rating < 3.5:
        weaknesses.append("⚠️ May have study environment noise/distractions")

    # Facilities reasoning
    if matched_facility_names:
        facility_str = ", ".join(matched_facility_names[:3])
        reasons.append(f"✓ Includes key facilities: {facility_str}")
    
    if scores.get("facilities", 0) < 60:
        weaknesses.append("⚠️ Offers fewer facilities than your preferred checklist")

    return reasons, weaknesses

def calculate_recommendation(
    boarding_place: Any,
    student_profile: Any,
    raw_weights: Dict[str, float],
    facility_map: Dict[int, str]
) -> Dict[str, Any]:
    """
    Executes the full Weighted Scoring Algorithm for a single boarding place against a student's preferences.
    """
    # 1. Distance Calculation (Haversine)
    distance_km = haversine_distance(
        student_profile.university_latitude,
        student_profile.university_longitude,
        boarding_place.latitude,
        boarding_place.longitude
    )

    # 2. Individual Criterion Scores (0 to 100)
    budget_score = calculate_budget_score(boarding_place.price, student_profile.budget)
    distance_score = calculate_distance_score(distance_km, student_profile.preferred_distance)
    
    boarding_fac_ids = [f.facility_id for f in boarding_place.facilities]
    req_fac_ids = [rf.facility_id for rf in student_profile.required_facilities]
    facility_score = calculate_facility_score(boarding_fac_ids, req_fac_ids)
    
    safety_score = calculate_rating_score(boarding_place.safety_rating, student_profile.safety_preference)
    study_score = calculate_rating_score(boarding_place.study_environment_rating, student_profile.study_environment_preference)

    criterion_scores = {
        "budget": budget_score,
        "distance": distance_score,
        "facilities": facility_score,
        "safety": safety_score,
        "study_environment": study_score
    }

    # 3. Dynamic Weight Normalization (sum to 1.0)
    normalized_weights = normalize_weights(raw_weights)

    # 4. Final Weighted Match Score Calculation (S = sum(w_i * s_i))
    final_match_score = (
        (normalized_weights["budget"] * budget_score) +
        (normalized_weights["distance"] * distance_score) +
        (normalized_weights["facilities"] * facility_score) +
        (normalized_weights["safety"] * safety_score) +
        (normalized_weights["study_environment"] * study_score)
    )
    final_match_score = round(max(0.0, min(100.0, final_match_score)), 1)

    # 5. Explainability (Reasons & Cautions)
    matched_facility_names = [facility_map[fid] for fid in boarding_fac_ids if fid in facility_map]
    reasons, weaknesses = generate_recommendation_explainability(
        boarding_place=boarding_place,
        student_profile=student_profile,
        distance_km=distance_km,
        scores=criterion_scores,
        matched_facility_names=matched_facility_names
    )

    return {
        "boarding_place": boarding_place,
        "match_score": final_match_score,
        "distance_km": distance_km,
        "breakdown": criterion_scores,
        "weights": {k: round(v * 100.0, 1) for k, v in normalized_weights.items()},
        "reasons": reasons,
        "weaknesses": weaknesses
    }
