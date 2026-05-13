'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { UserProfile } from './types'

interface AppContextType {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
  selectedLanguage: string
  setSelectedLanguage: (lang: string) => void
  currency: string
  setCurrency: (currency: string) => void
}

const defaultProfile: UserProfile = {
  name: '',
  country: 'France',
  language: 'en',
  currency: 'EUR',
  gender: 'prefer-not-to-say',
  tripDuration: 3,
  budget: 'moderate',
  travelingWith: 'couple',
  hasChildren: false,
  hasElderly: false,
  sunSensitivity: false,
  mobilityIssues: false,
  needsWheelchair: false,
  allergies: [],
  dietaryRestrictions: [],
  medicalConditions: [],
  medications: [],
  safetyPriority: 'moderate',
  routePreference: 'safest',
  interests: [],
  activityLevel: 'moderate',
  preferredTimes: 'flexible',
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [currency, setCurrency] = useState('EUR')

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        isOnboarded,
        setIsOnboarded,
        selectedLanguage,
        setSelectedLanguage,
        currency,
        setCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { defaultProfile }
