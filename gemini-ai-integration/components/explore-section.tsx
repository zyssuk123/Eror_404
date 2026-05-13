'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Star, 
  Heart, 
  MapPin, 
  Clock, 
  Filter,
  SlidersHorizontal,
  Leaf,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Place, PlaceCategory, UserProfile } from '@/lib/types'
import { SAMPLE_PLACES, CATEGORIES, EXCHANGE_RATES, CURRENCY_SYMBOLS, MORE_PLACES } from '@/lib/data'

interface ExploreSectionProps {
  userProfile: UserProfile
  category: PlaceCategory | null
  onBack: () => void
  onPlaceSelect: (place: Place) => void
}

export function ExploreSection({ userProfile, category, onBack, onPlaceSelect }: ExploreSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating')
  const [showEcoOnly, setShowEcoOnly] = useState(false)
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(userProfile.needsWheelchair)
  const [filterOpen, setFilterOpen] = useState(false)

  const categoryInfo = CATEGORIES.find(c => c.id === category)

  const getCategoryAvatar = () => {
    if (!categoryInfo) return '/avatars/guide-welcome.png'
    return `/avatars/guide-${categoryInfo.avatar}.png`
  }

  const allPlaces = [...SAMPLE_PLACES, ...MORE_PLACES]

  const filteredPlaces = allPlaces
    .filter(place => {
      if (category && place.category !== category) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          place.name.toLowerCase().includes(query) ||
          place.nameAr?.toLowerCase().includes(query) ||
          place.description.toLowerCase().includes(query) ||
          place.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      if (showEcoOnly && !place.isEcoCertified) return false
      if (showAccessibleOnly && !place.isAccessible) return false
      if (userProfile.sunSensitivity && !place.hasShadedAreas) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'reviews':
          return b.reviews - a.reviews
        case 'price':
          return (a.priceMAD?.min || 0) - (b.priceMAD?.min || 0)
        default:
          return 0
      }
    })

  const convertPrice = (priceMAD: number): string => {
    const rate = EXCHANGE_RATES[userProfile.currency] || 1
    const converted = priceMAD * rate
    const symbol = CURRENCY_SYMBOLS[userProfile.currency] || 'MAD'
    return `${converted.toFixed(0)} ${symbol}`
  }

  const toggleFavorite = (placeId: string) => {
    setFavorites(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  const getPriceDisplay = (priceRange: number) => {
    return Array(4).fill(0).map((_, i) => (
      <span key={i} className={i < priceRange ? 'text-primary' : 'text-muted-foreground/30'}>
        $
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-foreground">
                {categoryInfo?.label || 'Explore All'}
              </h1>
              {categoryInfo?.labelAr && (
                <p className="text-xs text-muted-foreground">{categoryInfo.labelAr}</p>
              )}
            </div>
            <div className="w-14 h-14">
              <img
                src={getCategoryAvatar()}
                alt="Guide"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${categoryInfo?.label.toLowerCase() || 'places'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <div className="py-4 space-y-6">
                  <h3 className="font-bold text-lg">Filters & Sort</h3>

                  <div>
                    <Label className="font-medium">Sort By</Label>
                    <RadioGroup
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as typeof sortBy)}
                      className="flex gap-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rating" id="sort-rating" />
                        <Label htmlFor="sort-rating">Rating</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reviews" id="sort-reviews" />
                        <Label htmlFor="sort-reviews">Reviews</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price" id="sort-price" />
                        <Label htmlFor="sort-price">Price (Low)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eco-filter"
                        checked={showEcoOnly}
                        onCheckedChange={(checked) => setShowEcoOnly(!!checked)}
                      />
                      <Label htmlFor="eco-filter" className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        Eco-Certified Only
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessible-filter"
                        checked={showAccessibleOnly}
                        onCheckedChange={(checked) => setShowAccessibleOnly(!!checked)}
                      />
                      <Label htmlFor="accessible-filter">
                        Wheelchair Accessible
                      </Label>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Results Count */}
      <div className="max-w-4xl mx-auto px-4 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground">
          {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'} found
          {(showEcoOnly || showAccessibleOnly) && (
            <span className="ml-2">
              {showEcoOnly && <Badge variant="outline" className="text-xs mr-1">Eco</Badge>}
              {showAccessibleOnly && <Badge variant="outline" className="text-xs">Accessible</Badge>}
            </span>
          )}
        </p>
      </div>

      {/* Results Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 opacity-50">
              <img
                src={getCategoryAvatar()}
                alt="No results"
                className="w-full h-full object-contain grayscale"
              />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No places found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onPlaceSelect(place)}
                className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="relative h-48">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(place.id)
                    }}
                    className="absolute top-3 right-3 w-9 h-9 bg-card/80 backdrop-blur rounded-full flex items-center justify-center transition-colors hover:bg-card"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(place.id)
                          ? 'fill-destructive text-destructive'
                          : 'text-foreground'
                      }`}
                    />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {place.isEcoCertified && (
                      <Badge className="bg-green-500/90 text-white text-xs">
                        <Leaf className="w-3 h-3 mr-1" />
                        Eco
                      </Badge>
                    )}
                    {place.isAccessible && (
                      <Badge className="bg-blue-500/90 text-white text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Accessible
                      </Badge>
                    )}
                  </div>

                  {/* Price Range */}
                  <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur rounded px-2 py-1 text-sm font-medium">
                    {getPriceDisplay(place.priceRange)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{place.name}</h3>
                      {place.nameAr && (
                        <p className="text-xs text-muted-foreground">{place.nameAr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm flex-shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{place.rating}</span>
                      <span className="text-muted-foreground">({place.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {place.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {place.openingHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {place.openingHours.split(' ')[0]}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Medina
                      </span>
                    </div>
                    {place.priceMAD && (
                      <span className="text-sm font-bold text-primary">
                        {place.priceMAD.min === 0 
                          ? 'Free' 
                          : `${convertPrice(place.priceMAD.min)}${place.priceMAD.max > place.priceMAD.min ? '+' : ''}`
                        }
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {place.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {place.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
