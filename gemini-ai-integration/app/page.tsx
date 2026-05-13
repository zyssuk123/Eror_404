'use client'

import { useState, Suspense, lazy } from 'react'
import dynamic from 'next/dynamic'
import { AppProvider, useApp } from '@/lib/context'
import { UserProfile, Place, PlaceCategory } from '@/lib/types'
import { OnboardingForm } from '@/components/onboarding-form'
import { Dashboard } from '@/components/dashboard'
import { ItineraryGenerator } from '@/components/itinerary-generator'
import { ExploreSection } from '@/components/explore-section'
import { Loader2 } from 'lucide-react'

// Dynamic import for map to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import('@/components/map-view').then(mod => ({ default: mod.MapView })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

type ViewType = 'onboarding' | 'dashboard' | 'map' | 'itinerary' | 'explore' | 'favorites'

function AppContent() {
  const { userProfile, setUserProfile, isOnboarded, setIsOnboarded } = useApp()
  const [currentView, setCurrentView] = useState<ViewType>('onboarding')
  const [exploreCategory, setExploreCategory] = useState<PlaceCategory | null>(null)
  const [mapPlaces, setMapPlaces] = useState<Place[] | undefined>(undefined)

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    setIsOnboarded(true)
    setCurrentView('dashboard')
  }

  const handleNavigate = (view: string, data?: unknown) => {
    switch (view) {
      case 'dashboard':
        setCurrentView('dashboard')
        break
      case 'map':
        setMapPlaces(undefined)
        setCurrentView('map')
        break
      case 'map-with-places':
        setMapPlaces(data as Place[])
        setCurrentView('map')
        break
      case 'itinerary':
        setCurrentView('itinerary')
        break
      case 'explore':
        setExploreCategory(data as PlaceCategory || null)
        setCurrentView('explore')
        break
      case 'favorites':
        setCurrentView('favorites')
        break
    }
  }

  const handleViewMapWithPlaces = (places: Place[]) => {
    setMapPlaces(places)
    setCurrentView('map')
  }

  // Show onboarding if not completed
  if (!isOnboarded || !userProfile) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />
  }

  // Render current view
  switch (currentView) {
    case 'map':
      return (
        <MapView
          userProfile={userProfile}
          onBack={() => setCurrentView('dashboard')}
          itineraryPlaces={mapPlaces}
        />
      )
    case 'itinerary':
      return (
        <ItineraryGenerator
          userProfile={userProfile}
          onBack={() => setCurrentView('dashboard')}
          onViewMap={handleViewMapWithPlaces}
        />
      )
    case 'explore':
      return (
        <ExploreSection
          userProfile={userProfile}
          category={exploreCategory}
          onBack={() => setCurrentView('dashboard')}
          onPlaceSelect={(place) => {
            setMapPlaces([place])
            setCurrentView('map')
          }}
        />
      )
    case 'dashboard':
    default:
      return (
        <Dashboard
          userProfile={userProfile}
          onNavigate={handleNavigate}
        />
      )
  }
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
