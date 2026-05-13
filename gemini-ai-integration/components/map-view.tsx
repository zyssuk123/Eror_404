'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, Navigation, Filter, X, Star, MapPin, Clock, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Place, PlaceCategory, UserProfile } from '@/lib/types'
import { SAMPLE_PLACES, MARRAKECH_CENTER, CATEGORIES, EXCHANGE_RATES, CURRENCY_SYMBOLS, MORE_PLACES, EXCHANGE_OFFICES, SAFE_ROUTES } from '@/lib/data'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom marker icons by category
const getCategoryIcon = (category: PlaceCategory, isEco?: boolean) => {
  const colors: Record<string, string> = {
    restaurant: '#f97316',
    hotel: '#3b82f6',
    riad: '#8b5cf6',
    monument: '#c4956a',
    shopping: '#ec4899',
    rooftop: '#f59e0b',
    spa: '#06b6d4',
    garden: '#22c55e',
    museum: '#6366f1',
    excursion: '#14b8a6',
  }

  const color = colors[category] || '#c4956a'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${isEco ? `<div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
        ">🌿</div>` : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

L.Marker.prototype.options.icon = DefaultIcon

interface MapViewProps {
  userProfile: UserProfile
  onBack: () => void
  itineraryPlaces?: Place[]
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

export function MapView({ userProfile, onBack, itineraryPlaces }: MapViewProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [filteredCategories, setFilteredCategories] = useState<PlaceCategory[]>([])
  const [showEcoOnly, setShowEcoOnly] = useState(false)
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false)
  const [showExchangeOffices, setShowExchangeOffices] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const allPlaces = [...SAMPLE_PLACES, ...MORE_PLACES]
  const displayPlaces = itineraryPlaces || allPlaces

  const filteredPlaces = displayPlaces.filter(place => {
    if (filteredCategories.length > 0 && !filteredCategories.includes(place.category)) {
      return false
    }
    if (showEcoOnly && !place.isEcoCertified) {
      return false
    }
    if (showAccessibleOnly && !place.isAccessible) {
      return false
    }
    return true
  })

  const toggleCategory = (category: PlaceCategory) => {
    setFilteredCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const convertPrice = (priceMAD: number): string => {
    const rate = EXCHANGE_RATES[userProfile.currency] || 1
    const converted = priceMAD * rate
    const symbol = CURRENCY_SYMBOLS[userProfile.currency] || 'MAD'
    return `${converted.toFixed(0)} ${symbol}`
  }

  // Create polyline for itinerary
  const itineraryPath = itineraryPlaces?.map(place => place.coordinates) || []

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-foreground">
              {itineraryPlaces ? 'Your Itinerary' : 'Explore Map'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredPlaces.length} places to discover
            </p>
          </div>
        </div>

        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
              {(filteredCategories.length > 0 || showEcoOnly || showAccessibleOnly) && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {filteredCategories.length + (showEcoOnly ? 1 : 0) + (showAccessibleOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <div className="py-4">
              <h3 className="font-bold text-lg mb-4">Filter Places</h3>

              <div className="space-y-6">
                <div>
                  <Label className="font-medium">Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CATEGORIES.map(category => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id as PlaceCategory)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2 ${
                          filteredCategories.includes(category.id as PlaceCategory)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eco"
                      checked={showEcoOnly}
                      onCheckedChange={(checked) => setShowEcoOnly(!!checked)}
                    />
                    <Label htmlFor="eco" className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Eco-Certified Only
                    </Label>
                  </div>

                  {(userProfile.needsWheelchair || userProfile.mobilityIssues) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessible"
                        checked={showAccessibleOnly}
                        onCheckedChange={(checked) => setShowAccessibleOnly(!!checked)}
                      />
                      <Label htmlFor="accessible">Accessible Only</Label>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFilteredCategories([])
                      setShowEcoOnly(false)
                      setShowAccessibleOnly(false)
                    }}
                  >
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={MARRAKECH_CENTER}
          zoom={14}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Itinerary path */}
          {itineraryPath.length > 1 && (
            <Polyline
              positions={itineraryPath}
              pathOptions={{
                color: '#c4956a',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />
          )}

          {/* Place markers */}
          {filteredPlaces.map((place, index) => (
            <Marker
              key={place.id}
              position={place.coordinates}
              icon={getCategoryIcon(place.category, place.isEcoCertified)}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <img 
                    src={place.imageUrl} 
                    alt={place.name}
                    className="w-full h-24 object-cover rounded-t-lg -mt-4 -mx-4 mb-3"
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                  <h3 className="font-bold text-foreground">{place.name}</h3>
                  {place.nameAr && (
                    <p className="text-xs text-muted-foreground">{place.nameAr}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{place.rating}</span>
                    </div>
                    {place.priceMAD && (
                      <span className="text-sm text-primary font-medium">
                        {convertPrice(place.priceMAD.min)}+
                      </span>
                    )}
                  </div>
                  {itineraryPlaces && (
                    <Badge className="mt-2 bg-primary">
                      Stop {index + 1}
                    </Badge>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          <MapController center={MARRAKECH_CENTER} zoom={14} />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-20 left-4 bg-card rounded-lg shadow-lg p-3 z-[1000] max-w-[200px]">
          <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { color: '#c4956a', label: 'Monuments' },
              { color: '#22c55e', label: 'Gardens' },
              { color: '#f97316', label: 'Food' },
              { color: '#ec4899', label: 'Shopping' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Location Button */}
        <Button
          size="icon"
          className="absolute bottom-20 right-4 z-[1000] bg-card text-foreground hover:bg-muted shadow-lg"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Selected Place Detail */}
      {selectedPlace && (
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-4 z-[1000] animate-in slide-in-from-bottom">
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-4">
            <img
              src={selectedPlace.imageUrl}
              alt={selectedPlace.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <div>
                  <h3 className="font-bold text-foreground">{selectedPlace.name}</h3>
                  {selectedPlace.nameAr && (
                    <p className="text-xs text-muted-foreground">{selectedPlace.nameAr}</p>
                  )}
                </div>
                {selectedPlace.isEcoCertified && (
                  <Badge className="bg-teal-500/90 text-white text-xs">Eco</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{selectedPlace.rating}</span>
                  <span className="text-muted-foreground">({selectedPlace.reviews})</span>
                </div>
                {selectedPlace.openingHours && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{selectedPlace.openingHours}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {selectedPlace.description}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" className="gap-1">
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </Button>
                {selectedPlace.priceMAD && (
                  <span className="text-sm font-bold text-primary">
                    {convertPrice(selectedPlace.priceMAD.min)}
                    {selectedPlace.priceMAD.max > selectedPlace.priceMAD.min && 
                      ` - ${convertPrice(selectedPlace.priceMAD.max)}`
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
