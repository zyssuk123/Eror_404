'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  MapPin, 
  Clock, 
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
  Navigation,
  Star,
  AlertTriangle,
  Check,
  RefreshCw,
  Map,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserProfile } from '@/lib/types'
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from '@/lib/data'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const RouteMapComponent = dynamic(
  () => import('./route-map').then((mod) => mod.RouteMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }
)

interface ItineraryGeneratorProps {
  userProfile: UserProfile
  onBack: () => void
  onViewMap: (places: any[]) => void
}

interface Activity {
  time: string
  placeName: string
  placeNameAr?: string
  category: string
  duration: string
  description: string
  ecoNote?: string
  tips?: string
  estimatedCost: number
  coordinates?: [number, number]
  imageUrl?: string
  isEcoCertified?: boolean
  isAccessible?: boolean
}

interface Day {
  dayNumber: number
  theme: string
  activities: Activity[]
}

interface ItineraryData {
  days: Day[]
  totalEstimatedBudget: { min: number; max: number }
  ecoTips: string[]
}

export function ItineraryGenerator({ userProfile, onBack, onViewMap }: ItineraryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [expandedDays, setExpandedDays] = useState<number[]>([1])
  const [error, setError] = useState<string | null>(null)
  const [showDayMap, setShowDayMap] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Day | null>(null)
  const [aiMessage, setAiMessage] = useState<string>('')

  const convertPrice = (priceMAD: number): string => {
    const rate = EXCHANGE_RATES[userProfile.currency] || 1
    const converted = priceMAD * rate
    const symbol = CURRENCY_SYMBOLS[userProfile.currency] || 'MAD'
    return `${converted.toFixed(0)} ${symbol}`
  }

  const generateItinerary = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      setItinerary(data.itinerary)
      setAiMessage(data.message || '')
      setExpandedDays([1]) // Expand first day by default
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev =>
      prev.includes(dayNumber)
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const getAllPlaces = () => {
    if (!itinerary) return []
    return itinerary.days.flatMap(day => 
      day.activities.map(activity => ({
        id: `${day.dayNumber}-${activity.placeName}`,
        name: activity.placeName,
        nameAr: activity.placeNameAr,
        category: activity.category,
        description: activity.description,
        coordinates: activity.coordinates || [31.6295 + Math.random() * 0.02 - 0.01, -7.9811 + Math.random() * 0.02 - 0.01] as [number, number],
        imageUrl: activity.imageUrl || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
        rating: 4.5,
        reviews: 100,
        priceRange: 2 as const,
        priceMAD: { min: activity.estimatedCost, max: activity.estimatedCost * 1.5 },
        address: 'Marrakech, Morocco',
        tags: [],
        isEcoCertified: activity.isEcoCertified,
        isAccessible: activity.isAccessible,
        hasShadedAreas: true,
        isFamilyFriendly: true,
      }))
    )
  }

  const getDayPlaces = (day: Day) => {
    return day.activities.map(activity => ({
      id: `${day.dayNumber}-${activity.placeName}`,
      name: activity.placeName,
      nameAr: activity.placeNameAr,
      category: activity.category,
      description: activity.description,
      coordinates: activity.coordinates || [31.6295 + Math.random() * 0.02 - 0.01, -7.9811 + Math.random() * 0.02 - 0.01] as [number, number],
      imageUrl: activity.imageUrl || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
      rating: 4.5,
      reviews: 100,
      priceRange: 2 as const,
      priceMAD: { min: activity.estimatedCost, max: activity.estimatedCost * 1.5 },
      address: 'Marrakech, Morocco',
      tags: [],
      isEcoCertified: activity.isEcoCertified,
      isAccessible: activity.isAccessible,
      hasShadedAreas: true,
      isFamilyFriendly: true,
    }))
  }

  const openGoogleMapsDirections = (activities: Activity[]) => {
    const places = activities.filter(a => a.coordinates)
    if (places.length < 2) return

    const first = places[0]
    const last = places[places.length - 1]
    const middle = places.slice(1, -1)

    let url = `https://www.google.com/maps/dir/?api=1&origin=${first.coordinates![0]},${first.coordinates![1]}&destination=${last.coordinates![0]},${last.coordinates![1]}&travelmode=walking`
    
    if (middle.length > 0) {
      const waypointStr = middle.map(p => `${p.coordinates![0]},${p.coordinates![1]}`).join('|')
      url += `&waypoints=${waypointStr}`
    }
    
    window.open(url, '_blank')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      restaurant: 'bg-orange-100 text-orange-800',
      hotel: 'bg-blue-100 text-blue-800',
      riad: 'bg-purple-100 text-purple-800',
      monument: 'bg-amber-100 text-amber-800',
      shopping: 'bg-pink-100 text-pink-800',
      rooftop: 'bg-yellow-100 text-yellow-800',
      spa: 'bg-cyan-100 text-cyan-800',
      garden: 'bg-green-100 text-green-800',
      museum: 'bg-indigo-100 text-indigo-800',
      excursion: 'bg-teal-100 text-teal-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">AI Itinerary Generator</h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
          </div>
          <div className="w-12 h-12">
            <img 
              src="/avatars/guide-welcome.png" 
              alt="Guide"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* User Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Your Trip Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{userProfile.tripDuration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="capitalize">{userProfile.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="capitalize">{userProfile.travelingWith}</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span>Eco-Friendly</span>
              </div>
            </div>

            {/* Health Constraints */}
            {(userProfile.sunSensitivity || userProfile.mobilityIssues || userProfile.allergies.length > 0) && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Your constraints will be respected:</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.sunSensitivity && (
                    <Badge variant="outline" className="text-xs">Sun-Sensitive</Badge>
                  )}
                  {userProfile.mobilityIssues && (
                    <Badge variant="outline" className="text-xs">Mobility</Badge>
                  )}
                  {userProfile.allergies.map(allergy => (
                    <Badge key={allergy} variant="outline" className="text-xs">{allergy} Allergy</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button or Results */}
        {!itinerary ? (
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <img 
                src="/avatars/guide-monuments.png" 
                alt="Guide"
                className={`w-full h-full object-contain ${isGenerating ? 'animate-pulse' : 'animate-float'}`}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              {isGenerating ? 'Creating Your Perfect Itinerary...' : 'Ready to Explore Marrakech?'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isGenerating 
                ? 'Our AI is crafting a personalized, eco-responsible itinerary just for you'
                : 'Click below to generate a personalized itinerary based on your preferences and health needs'
              }
            </p>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              size="lg"
              onClick={generateItinerary}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My Itinerary
                </>
              )}
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* AI Message Badge */}
              {aiMessage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {aiMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={generateItinerary}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  onClick={() => onViewMap(getAllPlaces())}
                  className="gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  View Full Map
                </Button>
              </div>

              {/* Budget Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Total Budget</p>
                      <p className="text-2xl font-bold text-primary">
                        {convertPrice(itinerary.totalEstimatedBudget.min)} - {convertPrice(itinerary.totalEstimatedBudget.max)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Leaf className="w-5 h-5" />
                      <span className="text-sm font-medium">Eco-Friendly Trip</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Itinerary */}
              <div className="space-y-4">
                {itinerary.days.map((day) => (
                  <Card key={day.dayNumber} className="overflow-hidden">
                    <button
                      onClick={() => toggleDay(day.dayNumber)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {day.dayNumber}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Day {day.dayNumber}</p>
                          <p className="text-sm text-muted-foreground">{day.theme}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{day.activities.length} stops</Badge>
                        {expandedDays.includes(day.dayNumber) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedDays.includes(day.dayNumber) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="pt-0 pb-4">
                            {/* Visual Rendering - Circuit Display with Map */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              {/* Circuit Display */}
                              <div className="bg-muted/30 rounded-lg p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  Affichage du Circuit
                                </h4>
                                {day.activities[0] && (
                                  <div className="flex gap-3 items-start">
                                    {day.activities[0].imageUrl && (
                                      <img 
                                        src={day.activities[0].imageUrl} 
                                        alt={day.activities[0].placeName}
                                        className="w-20 h-20 rounded-lg object-cover"
                                      />
                                    )}
                                    <div>
                                      <h5 className="font-medium">{day.activities[0].placeName}</h5>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {day.activities[0].ecoNote || day.activities[0].description}
                                      </p>
                                      {day.activities[0].isEcoCertified && (
                                        <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                          <Leaf className="w-3 h-3 mr-1" />
                                          Eco-certified
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Interactive Map Preview */}
                              <div className="bg-muted/30 rounded-lg p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Map className="w-4 h-4 text-primary" />
                                  Carte Interactive
                                </h4>
                                <div 
                                  className="h-32 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    setSelectedDay(day)
                                    setShowDayMap(true)
                                  }}
                                >
                                  <RouteMapComponent
                                    waypoints={day.activities
                                      .filter(a => a.coordinates)
                                      .map(a => a.coordinates as [number, number])}
                                    places={getDayPlaces(day) as any}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  via Leaflet.js - Click to expand
                                </p>
                              </div>
                            </div>

                            {/* Day Action Buttons */}
                            <div className="flex gap-2 mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  setSelectedDay(day)
                                  setShowDayMap(true)
                                }}
                              >
                                <Map className="w-4 h-4" />
                                View Day Map
                              </Button>
                              <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => openGoogleMapsDirections(day.activities)}
                              >
                                <Navigation className="w-4 h-4" />
                                Navigate Day
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="space-y-4 border-l-2 border-primary/20 ml-5 pl-8">
                              {day.activities.map((activity, idx) => (
                                <div key={idx} className="relative">
                                  {/* Timeline dot */}
                                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                                  
                                  <div className="bg-muted/30 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-primary">{activity.time}</span>
                                        <Badge className={getCategoryColor(activity.category)}>
                                          {activity.category}
                                        </Badge>
                                      </div>
                                      {activity.isEcoCertified && (
                                        <Badge className="bg-green-100 text-green-800">
                                          <Leaf className="w-3 h-3 mr-1" />
                                          Eco
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex gap-3">
                                      {activity.imageUrl && (
                                        <img 
                                          src={activity.imageUrl}
                                          alt={activity.placeName}
                                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        />
                                      )}
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">{activity.placeName}</h4>
                                        {activity.placeNameAr && (
                                          <p className="text-xs text-muted-foreground mb-2">{activity.placeNameAr}</p>
                                        )}

                                        <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                                      </div>
                                    </div>

                                    {activity.ecoNote && (
                                      <div className="bg-green-50 border border-green-200 rounded p-2 mb-3 mt-3">
                                        <p className="text-xs text-green-800 flex items-start gap-1">
                                          <Leaf className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                          {activity.ecoNote}
                                        </p>
                                      </div>
                                    )}

                                    {activity.tips && (
                                      <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                                        <p className="text-xs text-amber-800 flex items-start gap-1">
                                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                          {activity.tips}
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="w-4 h-4" />
                                          {activity.duration}
                                        </span>
                                        {activity.isAccessible && (
                                          <Badge variant="outline" className="text-xs">
                                            <Check className="w-3 h-3 mr-1" />
                                            Accessible
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="font-medium text-primary">
                                        ~{convertPrice(activity.estimatedCost)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>

              {/* Eco Tips */}
              {itinerary.ecoTips && itinerary.ecoTips.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      Eco-Tourism Tips
                    </h3>
                    <ul className="space-y-2">
                      {itinerary.ecoTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                          <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Day Map Dialog */}
      <Dialog open={showDayMap} onOpenChange={setShowDayMap}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Day {selectedDay?.dayNumber} - {selectedDay?.theme}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-4">
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <RouteMapComponent
                  waypoints={selectedDay.activities
                    .filter(a => a.coordinates)
                    .map(a => a.coordinates as [number, number])}
                  places={getDayPlaces(selectedDay) as any}
                />
              </div>

              {/* Day Places List */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Day Stops:</p>
                {selectedDay.activities.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.placeName}</p>
                      <p className="text-xs text-muted-foreground">{activity.time} - {activity.duration}</p>
                    </div>
                    {activity.coordinates && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${activity.coordinates![0]},${activity.coordinates![1]}`
                          window.open(url, '_blank')
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full gap-2"
                onClick={() => openGoogleMapsDirections(selectedDay.activities)}
              >
                <Navigation className="w-4 h-4" />
                Open Day Route in Google Maps
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
