import { describe, expect, it } from 'vitest'
import { normaliseWeights, passesFilters, recommend, scoreListing } from './recommend'
const prefs = { gender:'male',budget:20000,maxDistance:3,roomType:'any',facilities:[],safety:[],weights:{price:25,distance:25,facilities:25,safety:25} }
const item = { listing_id:'A',available:'yes',gender_policy:'any',price_monthly:'10000',distance_to_campus_km:'1',room_type:'single',avg_rating:'5',cctv:'1',gated:'1',good_lighting:'1',landlord_resident:'1' }
describe('recommendation utilities', () => {
  it('normalises arbitrary weights to one', () => expect(Object.values(normaliseWeights({price:4,distance:2,facilities:2,safety:2})).reduce((a,b)=>a+b,0)).toBeCloseTo(1))
  it('applies hard filters', () => { expect(passesFilters(item,prefs)).toBe(true); expect(passesFilters({...item,price_monthly:'21000'},prefs)).toBe(false); expect(passesFilters({...item,gender_policy:'female'},prefs)).toBe(false) })
  it('calculates score and ranks higher matches first', () => { const poor={...item,listing_id:'B',price_monthly:'19000',distance_to_campus_km:'2.8',avg_rating:'1',cctv:'0',gated:'0',good_lighting:'0',landlord_resident:'0'}; expect(scoreListing(item,prefs).score).toBeGreaterThan(scoreListing(poor,prefs).score); expect(recommend([poor,item],prefs)[0].listing_id).toBe('A') })
})
