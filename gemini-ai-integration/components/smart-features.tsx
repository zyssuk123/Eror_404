'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  DollarSign,
  Shield,
  Shirt,
  Stethoscope,
  Route,
  Sparkles,
  ChevronRight,
  Star,
  Clock,
  AlertTriangle,
  Check,
  Banknote,
  Wind,
  Leaf,
  X,
  Navigation,
  ExternalLink,
  Map,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserProfile, Circuit, SafeRoute } from '@/lib/types'
import {
  EXCHANGE_OFFICES,
  DRESS_CODES,
  PRICE_SCAN_ITEMS,
  CIRCUITS,
  SAFE_ROUTES,
  CURRENCY_SYMBOLS,
  EXCHANGE_RATES,
  GUIDE_AVATARS,
  SAMPLE_PLACES,
  MORE_PLACES,
} from '@/lib/data'
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

interface SmartFeaturesProps {
  profile: UserProfile
}

export function SmartFeatures({ profile }: SmartFeaturesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<SafeRoute | null>(null)
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null)
  const [showRouteMap, setShowRouteMap] = useState(false)
  const [showCircuitMap, setShowCircuitMap] = useState(false)

  const convertPrice = (priceMAD: number): string => {
    const rate = EXCHANGE_RATES[profile.currency] || 1
    const converted = priceMAD * rate
    const symbol = CURRENCY_SYMBOLS[profile.currency] || profile.currency
    return `${converted.toFixed(0)} ${symbol}`
  }

  // Get all places for circuit mapping
  const allPlaces = useMemo(() => [...SAMPLE_PLACES, ...MORE_PLACES], [])

  // Get circuit places with coordinates
  const getCircuitPlaces = (circuit: Circuit) => {
    return circuit.places
      .map(placeId => allPlaces.find(p => p.id === placeId))
      .filter(Boolean)
  }

  // Open Google Maps with directions
  const openGoogleMapsDirections = (startCoords: [number, number], endCoords: [number, number], waypoints?: [number, number][]) => {
    let url = `https://www.google.com/maps/dir/?api=1&origin=${startCoords[0]},${startCoords[1]}&destination=${endCoords[0]},${endCoords[1]}&travelmode=walking`
    
    if (waypoints && waypoints.length > 0) {
      const waypointStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('|')
      url += `&waypoints=${waypointStr}`
    }
    
    window.open(url, '_blank')
  }

  // Open Google Maps for a single location
  const openGoogleMapsLocation = (coords: [number, number], name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}&query_place_id=${encodeURIComponent(name)}`
    window.open(url, '_blank')
  }

  // Filter price scan items based on search
  const filteredPriceItems = useMemo(() => {
    if (!searchQuery.trim()) return PRICE_SCAN_ITEMS
    const query = searchQuery.toLowerCase().trim()
    return PRICE_SCAN_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.nameAr.includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.whereToFind.some(place => place.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const features = [
    {
      id: 'exchange',
      title: 'Money Exchange',
      titleAr: 'صرف العملات',
      description: 'Find trusted exchange offices',
      icon: Banknote,
      color: 'bg-emerald-500',
      avatar: GUIDE_AVATARS.shopping,
    },
    {
      id: 'dresscode',
      title: 'Dress Code Guide',
      titleAr: 'دليل اللباس',
      description: 'What to wear for each place',
      icon: Shirt,
      color: 'bg-purple-500',
      avatar: GUIDE_AVATARS.welcome,
    },
    {
      id: 'pricescanner',
      title: 'Price Scanner',
      titleAr: 'ماسح الأسعار',
      description: 'Fair prices for souvenirs',
      icon: DollarSign,
      color: 'bg-amber-500',
      avatar: GUIDE_AVATARS.shopping,
    },
    {
      id: 'saferoute',
      title: 'Safe Routes',
      titleAr: 'طرق آمنة',
      description: 'Choose your walking style',
      icon: Route,
      color: 'bg-blue-500',
      avatar: GUIDE_AVATARS.monuments,
    },
    {
      id: 'circuits',
      title: 'Ready Circuits',
      titleAr: 'جولات جاهزة',
      description: 'Pre-planned itineraries',
      icon: MapPin,
      color: 'bg-rose-500',
      avatar: GUIDE_AVATARS.food,
    },
    {
      id: 'health',
      title: 'Health Alerts',
      titleAr: 'تنبيهات صحية',
      description: 'Based on your conditions',
      icon: Stethoscope,
      color: 'bg-red-500',
      avatar: GUIDE_AVATARS.welcome,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Sheet key={feature.id}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30 h-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <img src={feature.avatar} alt="" className="w-16 h-16 object-contain" />
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5" />
                      {feature.title}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6">
                {/* Exchange Offices */}
                {feature.id === 'exchange' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Trusted Offices Only</p>
                          <p className="text-xs text-emerald-700 mt-1">
                            We only list verified exchange offices with fair rates. Avoid street changers!
                          </p>
                        </div>
                      </div>
                    </div>

                    {EXCHANGE_OFFICES.map((office) => (
                      <Card key={office.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{office.name}</h4>
                                {office.isTrusted && (
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                    <Check className="w-3 h-3 mr-1" />
                                    Trusted
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{office.address}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  {office.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {office.openingHours}
                                </span>
                                <Badge variant={office.fees === 'low' ? 'default' : 'secondary'}>
                                  {office.fees} fees
                                </Badge>
                              </div>
                              {office.tips && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  Tip: {office.tips}
                                </p>
                              )}
                              
                              {/* Location Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 gap-2"
                                onClick={() => openGoogleMapsLocation(office.coordinates, office.name)}
                              >
                                <Navigation className="w-4 h-4" />
                                Get Directions
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Dress Code */}
                {feature.id === 'dresscode' && (
                  <div className="space-y-4">
                    {DRESS_CODES.map((code, idx) => (
                      <Card key={idx} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg capitalize flex items-center gap-2">
                            <Shirt className="w-5 h-5" />
                            {code.placeType.replace('_', ' ')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {code.required.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-red-600 uppercase mb-1">Required</p>
                              <ul className="text-sm space-y-1">
                                {code.required.map((item, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-red-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Recommended</p>
                            <div className="flex flex-wrap gap-1">
                              {code.recommended.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Avoid</p>
                            <div className="flex flex-wrap gap-1">
                              {code.avoid.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  <X className="w-3 h-3 mr-1" />
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 mt-2">
                            <p className="text-xs text-muted-foreground">
                              <Sparkles className="w-3 h-3 inline mr-1" />
                              {code.tips}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Price Scanner */}
                {feature.id === 'pricescanner' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Bargaining Guide</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Start at 40-50% of the asking price. Be friendly and patient - it is part of the culture!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items (bag, carpet, spices...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {filteredPriceItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No items found for &quot;{searchQuery}&quot;</p>
                        <p className="text-sm">Try searching for: bag, carpet, spices, lantern...</p>
                      </div>
                    ) : (
                      filteredPriceItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{item.nameAr}</p>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Price Range:</span>
                                    <span className="font-medium">
                                      {convertPrice(item.priceRange.min)} - {convertPrice(item.priceRange.max)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Fair Price:</span>
                                    <span className="font-bold text-emerald-600">
                                      {convertPrice(item.fairPrice)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <p className="text-xs font-semibold mb-1">Tips:</p>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {item.tips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="mt-2">
                                  <p className="text-xs font-semibold mb-1">Where to find:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.whereToFind.map((place, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {place}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* Safe Routes */}
                {feature.id === 'saferoute' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Your Preference: {profile.routePreference}</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Routes are adapted to your safety priority and health conditions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {SAFE_ROUTES.map((route) => (
                      <Card key={route.id} className={`overflow-hidden ${route.type === profile.routePreference ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{route.name}</h4>
                                <Badge
                                  variant={route.type === profile.routePreference ? 'default' : 'outline'}
                                  className="text-xs capitalize"
                                >
                                  {route.type === 'zen' && <Wind className="w-3 h-3 mr-1" />}
                                  {route.type === 'senteurs' && <Leaf className="w-3 h-3 mr-1" />}
                                  {route.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{route.description}</p>

                              {/* Start and End Points */}
                              {route.startPoint && route.endPoint && (
                                <div className="mt-3 p-2 bg-muted/50 rounded-lg text-xs">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="font-medium">Start:</span>
                                    <span>{route.startPoint.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="font-medium">End:</span>
                                    <span>{route.endPoint.name}</span>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-blue-500" />
                                  Safety: {route.safetyRating}/5
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  ~{route.estimatedTime} min
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  {route.shadedPercentage}% shaded
                                </div>
                                <div className="flex items-center gap-1">
                                  Crowd: {route.crowdLevel}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-3">
                                {route.features.map((feat, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {feat}
                                  </Badge>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 flex-1"
                                  onClick={() => {
                                    setSelectedRoute(route)
                                    setShowRouteMap(true)
                                  }}
                                >
                                  <Map className="w-4 h-4" />
                                  View Map
                                </Button>
                                <Button
                                  size="sm"
                                  className="gap-2 flex-1"
                                  onClick={() => {
                                    if (route.startPoint && route.endPoint) {
                                      const middleWaypoints = route.waypoints.slice(1, -1)
                                      openGoogleMapsDirections(
                                        route.startPoint.coordinates,
                                        route.endPoint.coordinates,
                                        middleWaypoints
                                      )
                                    }
                                  }}
                                >
                                  <Navigation className="w-4 h-4" />
                                  Navigate
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Ready Circuits */}
                {feature.id === 'circuits' && (
                  <div className="space-y-4">
                    {CIRCUITS.map((circuit) => {
                      const circuitPlaces = getCircuitPlaces(circuit)
                      
                      return (
                        <Card key={circuit.id} className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img
                              src={circuit.imageUrl}
                              alt={circuit.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="font-bold text-white text-lg">{circuit.name}</h4>
                              <p className="text-white/80 text-sm">{circuit.nameAr}</p>
                            </div>
                            <Badge className="absolute top-3 right-3 capitalize">
                              {circuit.type}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{circuit.description}</p>

                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {circuit.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {convertPrice(circuit.budget.min)} - {convertPrice(circuit.budget.max)}
                              </div>
                              <div className="flex items-center gap-1 capitalize">
                                Difficulty: {circuit.difficulty}
                              </div>
                              <div className="flex items-center gap-1">
                                Best: {circuit.bestTime.split(' ')[0]}
                              </div>
                            </div>

                            {/* Circuit Stops */}
                            {circuitPlaces.length > 0 && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-semibold mb-2">Circuit Stops:</p>
                                <div className="space-y-2">
                                  {circuitPlaces.map((place, idx) => (
                                    <div key={place?.id} className="flex items-center gap-2 text-xs">
                                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                      </div>
                                      <span>{place?.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-3">
                              <p className="text-xs font-semibold mb-1">Highlights:</p>
                              <div className="flex flex-wrap gap-1">
                                {circuit.highlights.map((hl, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {hl}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-xs font-semibold mb-1">Dress Code:</p>
                              <div className="flex flex-wrap gap-1">
                                {circuit.dressCode.map((dc, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <Shirt className="w-3 h-3 mr-1" />
                                    {dc}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 flex-1"
                                onClick={() => {
                                  setSelectedCircuit(circuit)
                                  setShowCircuitMap(true)
                                }}
                              >
                                <Map className="w-4 h-4" />
                                View Map
                              </Button>
                              <Button 
                                className="flex-1 gap-2"
                                onClick={() => {
                                  if (circuitPlaces.length >= 2) {
                                    const firstPlace = circuitPlaces[0]
                                    const lastPlace = circuitPlaces[circuitPlaces.length - 1]
                                    const middlePlaces = circuitPlaces.slice(1, -1)
                                    
                                    if (firstPlace && lastPlace) {
                                      openGoogleMapsDirections(
                                        firstPlace.coordinates,
                                        lastPlace.coordinates,
                                        middlePlaces.map(p => p!.coordinates)
                                      )
                                    }
                                  }
                                }}
                              >
                                <Navigation className="w-4 h-4" />
                                Start Circuit
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Health Alerts */}
                {feature.id === 'health' && (
                  <div className="space-y-4">
                    {profile.medicalConditions.length > 0 && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2 text-red-800">
                            <Stethoscope className="w-5 h-5" />
                            Your Medical Conditions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {profile.medicalConditions.map((condition, i) => (
                              <Badge key={i} variant="secondary" className="bg-red-100 text-red-700">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {profile.sunSensitivity && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-800">Sun Sensitivity Active</p>
                              <p className="text-sm text-amber-700 mt-1">
                                We will recommend shaded routes and indoor activities during peak sun hours (11 AM - 4 PM).
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {profile.allergies.length > 0 && (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="w-5 h-5" />
                            Your Allergies
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {profile.allergies.map((allergy, i) => (
                              <Badge key={i} variant="secondary" className="bg-orange-100 text-orange-700">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-orange-700 mt-3">
                            We will alert you about dishes containing these ingredients and suggest safe alternatives.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Emergency Contacts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tourist Police</span>
                          <span className="font-mono font-bold">19</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Emergency</span>
                          <span className="font-mono font-bold">15</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ambulance</span>
                          <span className="font-mono font-bold">150</span>
                        </div>
                      </CardContent>
                    </Card>

                    {profile.medicalConditions.length === 0 &&
                      profile.allergies.length === 0 &&
                      !profile.sunSensitivity && (
                        <Card className="border-emerald-200 bg-emerald-50">
                          <CardContent className="p-4 text-center">
                            <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="font-medium text-emerald-800">No health concerns registered</p>
                            <p className="text-sm text-emerald-700 mt-1">
                              Update your profile to receive personalized health alerts.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>

      {/* Route Map Dialog */}
      <Dialog open={showRouteMap} onOpenChange={setShowRouteMap}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              {selectedRoute?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedRoute.description}</p>
              
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <RouteMapComponent
                  waypoints={selectedRoute.waypoints}
                  startPoint={selectedRoute.startPoint}
                  endPoint={selectedRoute.endPoint}
                />
              </div>

              <Button 
                className="w-full gap-2"
                onClick={() => {
                  if (selectedRoute.startPoint && selectedRoute.endPoint) {
                    const middleWaypoints = selectedRoute.waypoints.slice(1, -1)
                    openGoogleMapsDirections(
                      selectedRoute.startPoint.coordinates,
                      selectedRoute.endPoint.coordinates,
                      middleWaypoints
                    )
                  }
                }}
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Circuit Map Dialog */}
      <Dialog open={showCircuitMap} onOpenChange={setShowCircuitMap}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {selectedCircuit?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCircuit && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedCircuit.description}</p>
              
              {(() => {
                const circuitPlaces = getCircuitPlaces(selectedCircuit)
                const waypoints = circuitPlaces
                  .filter(Boolean)
                  .map(p => p!.coordinates)
                
                const startPoint = circuitPlaces[0] 
                  ? { name: circuitPlaces[0].name, coordinates: circuitPlaces[0].coordinates }
                  : undefined
                
                const endPoint = circuitPlaces[circuitPlaces.length - 1]
                  ? { name: circuitPlaces[circuitPlaces.length - 1]!.name, coordinates: circuitPlaces[circuitPlaces.length - 1]!.coordinates }
                  : undefined

                return (
                  <>
                    <div className="h-[400px] rounded-lg overflow-hidden border">
                      <RouteMapComponent
                        waypoints={waypoints}
                        startPoint={startPoint}
                        endPoint={endPoint}
                        places={circuitPlaces.filter(Boolean) as typeof SAMPLE_PLACES}
                      />
                    </div>

                    {/* Circuit Places List */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Circuit Stops:</p>
                      {circuitPlaces.map((place, idx) => (
                        <div 
                          key={place?.id} 
                          className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{place?.name}</p>
                            <p className="text-xs text-muted-foreground">{place?.nameAr}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => place && openGoogleMapsLocation(place.coordinates, place.name)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        if (circuitPlaces.length >= 2) {
                          const firstPlace = circuitPlaces[0]
                          const lastPlace = circuitPlaces[circuitPlaces.length - 1]
                          const middlePlaces = circuitPlaces.slice(1, -1)
                          
                          if (firstPlace && lastPlace) {
                            openGoogleMapsDirections(
                              firstPlace.coordinates,
                              lastPlace.coordinates,
                              middlePlaces.map(p => p!.coordinates)
                            )
                          }
                        }
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                      Start Circuit in Google Maps
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
