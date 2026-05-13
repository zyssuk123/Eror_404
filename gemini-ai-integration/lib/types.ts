export interface UserProfile {
  // Personal Info
  name: string
  country: string
  language: 'en' | 'fr' | 'ar' | 'es' | 'de'
  currency: 'MAD' | 'EUR' | 'USD' | 'GBP'
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  
  // Trip Details
  tripDuration: number // days
  budget: 'budget' | 'moderate' | 'luxury'
  budgetAmount?: number
  
  // Family Situation
  travelingWith: 'solo' | 'couple' | 'family' | 'friends' | 'group'
  hasChildren: boolean
  childrenAges?: number[]
  hasElderly: boolean
  
  // Health & Accessibility
  sunSensitivity: boolean
  mobilityIssues: boolean
  needsWheelchair: boolean
  allergies: string[]
  dietaryRestrictions: string[]
  medicalConditions: string[]
  medications?: string[]
  
  // Safety & Comfort
  safetyPriority: 'relaxed' | 'moderate' | 'high'
  routePreference: 'fastest' | 'safest' | 'scenic' | 'zen' | 'senteurs'
  
  // Preferences
  interests: string[]
  activityLevel: 'relaxed' | 'moderate' | 'active'
  preferredTimes: 'morning' | 'afternoon' | 'evening' | 'flexible'
}

export interface Place {
  id: string
  name: string
  nameAr?: string
  category: PlaceCategory
  description: string
  ecoDescription?: string
  address: string
  coordinates: [number, number]
  rating: number
  reviews: number
  priceRange: 1 | 2 | 3 | 4
  priceMAD?: { min: number; max: number }
  openingHours?: string
  imageUrl: string
  tags: string[]
  isEcoCertified?: boolean
  isAccessible?: boolean
  hasShadedAreas?: boolean
  isFamilyFriendly?: boolean
}

export type PlaceCategory = 
  | 'restaurant'
  | 'hotel'
  | 'riad'
  | 'monument'
  | 'shopping'
  | 'rooftop'
  | 'spa'
  | 'garden'
  | 'museum'
  | 'excursion'

export interface Itinerary {
  id: string
  name: string
  description: string
  duration: string
  places: ItineraryStop[]
  totalBudget: { min: number; max: number }
  ecoScore: number
  accessibilityScore: number
}

export interface ItineraryStop {
  place: Place
  order: number
  suggestedTime: string
  duration: string
  tips?: string
  alternatives?: Place[]
}

export interface Review {
  id: string
  userId: string
  userName: string
  userCountry: string
  placeId: string
  rating: number
  comment: string
  date: string
  helpful: number
  images?: string[]
}

export interface Alert {
  id: string
  type: 'health' | 'weather' | 'scam' | 'safety' | 'tip'
  title: string
  message: string
  severity: 'info' | 'warning' | 'danger'
  relevantTo?: string[] // e.g., ['sun-sensitive', 'allergic-nuts']
}

export interface CurrencyRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  MAD: 'DH',
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export const EXCHANGE_RATES: Record<string, number> = {
  EUR: 0.092,
  USD: 0.098,
  GBP: 0.078,
  MAD: 1,
}

// Money Exchange Office
export interface ExchangeOffice {
  id: string
  name: string
  address: string
  coordinates: [number, number]
  rating: number
  isTrusted: boolean
  fees: 'low' | 'medium' | 'high'
  openingHours: string
  phone?: string
  tips?: string
}

// Dress Code for places
export interface DressCode {
  placeType: string
  required: string[]
  recommended: string[]
  avoid: string[]
  tips: string
}

// Safe Route
export interface SafeRoute {
  id: string
  name: string
  type: 'fastest' | 'safest' | 'scenic' | 'zen' | 'senteurs'
  description: string
  waypoints: [number, number][]
  crowdLevel: 'low' | 'medium' | 'high'
  safetyRating: number
  shadedPercentage: number
  estimatedTime: number
  features: string[]
  startPoint?: { name: string; coordinates: [number, number] }
  endPoint?: { name: string; coordinates: [number, number] }
}

// Price Scanner Item
export interface PriceScanItem {
  id: string
  name: string
  nameAr: string
  category: string
  priceRange: { min: number; max: number }
  fairPrice: number
  tips: string[]
  whereToFind: string[]
  imageUrl?: string
}

// Pre-made Circuit
export interface Circuit {
  id: string
  name: string
  nameAr: string
  description: string
  duration: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  type: 'cultural' | 'food' | 'shopping' | 'nature' | 'photo' | 'romantic' | 'family'
  highlights: string[]
  places: string[]
  bestTime: string
  dressCode: string[]
  budget: { min: number; max: number }
  imageUrl: string
}
