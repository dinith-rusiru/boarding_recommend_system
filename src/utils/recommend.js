export const facilityKeys = ['meals', 'study_space', 'attached_bathroom', 'water_24h', 'parking', 'furnished']
export const safetyKeys = ['cctv', 'gated', 'good_lighting', 'landlord_resident']

const number = (v) => Number(v) || 0
const yes = (v) => String(v).toLowerCase() === 'yes' || String(v) === '1' || v === true
const featureScore = (listing, keys) => keys.filter(key => yes(listing[key])).length / keys.length

export function normaliseWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + number(value), 0)
  if (!total) return { price: .25, distance: .25, facilities: .25, safety: .25 }
  return Object.fromEntries(Object.entries(weights).map(([key, value]) => [key, number(value) / total]))
}

export function passesFilters(listing, preferences) {
  return yes(listing.available) && (listing.gender_policy === preferences.gender || listing.gender_policy === 'any') && number(listing.price_monthly) <= number(preferences.budget) && number(listing.distance_to_campus_km) <= number(preferences.maxDistance) && (preferences.roomType === 'any' || listing.room_type === preferences.roomType)
}

export function scoreListing(listing, preferences) {
  const price = Math.max(0, 1 - number(listing.price_monthly) / number(preferences.budget))
  const distance = Math.max(0, 1 - number(listing.distance_to_campus_km) / number(preferences.maxDistance))
  const facilities = preferences.facilities.length ? featureScore(listing, preferences.facilities) : 1
  const safetyBase = preferences.safety.length ? featureScore(listing, preferences.safety) : featureScore(listing, safetyKeys)
  const safety = .7 * safetyBase + .3 * (number(listing.avg_rating) / 5)
  const scores = { price, distance, facilities, safety }
  const weights = normaliseWeights(preferences.weights)
  const score = 100 * Object.entries(scores).reduce((total, [key, value]) => total + value * weights[key], 0)
  return { ...listing, score, scores }
}

export function recommend(listings, preferences) {
  return listings.filter(item => passesFilters(item, preferences)).map(item => scoreListing(item, preferences)).sort((a, b) => b.score - a.score || number(a.price_monthly) - number(b.price_monthly))
}
