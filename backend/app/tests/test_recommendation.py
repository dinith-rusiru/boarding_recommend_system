import pytest
from app.recommendation.engine import (
    haversine_distance,
    calculate_budget_score,
    calculate_distance_score,
    calculate_facility_score,
    calculate_rating_score,
    normalize_weights,
    priority_to_raw_weight
)

def test_haversine_distance():
    # University of Colombo Reid Ave (6.9000, 79.8588) to Reid Ave boarding (6.9025, 79.8605)
    dist = haversine_distance(6.9000, 79.8588, 6.9025, 79.8605)
    assert dist > 0
    assert dist < 1.0 # Less than 1 km

def test_budget_scoring():
    max_budget = 25000.0
    
    # Lower price gets savings bonus (>85)
    score_low = calculate_budget_score(20000.0, max_budget)
    assert score_low > 85.0
    
    # Exact budget gets ~85
    score_exact = calculate_budget_score(25000.0, max_budget)
    assert abs(score_exact - 85.0) < 1.0

    # Over budget decays
    score_over = calculate_budget_score(30000.0, max_budget)
    assert score_over < 85.0

def test_distance_scoring():
    preferred_dist = 3.0
    
    # Closer distance gets score near 100
    score_near = calculate_distance_score(1.0, preferred_dist)
    assert score_near >= 90.0

    # Farther distance decays
    score_far = calculate_distance_score(6.0, preferred_dist)
    assert score_far < 70.0

def test_facility_matching():
    req_ids = [1, 2, 3, 4]
    boarding_ids = [1, 2, 3, 5, 6]
    
    # 3 out of 4 matched = 75%
    score = calculate_facility_score(boarding_ids, req_ids)
    assert score == 75.0

def test_weight_normalization():
    raw_weights = {
        "budget": 35.0,
        "distance": 25.0,
        "facilities": 20.0,
        "safety": 15.0,
        "study_environment": 5.0
    }
    normalized = normalize_weights(raw_weights)
    total = sum(normalized.values())
    assert abs(total - 1.0) < 0.001
    assert normalized["budget"] == 0.35
