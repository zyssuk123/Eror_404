'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Heart,
  MapPin,
  Clock,
  Phone,
  Globe,
  Share2,
  Navigation,
  MessageCircle,
  ThumbsUp,
  Leaf,
  Check,
  AlertTriangle,
  ChevronRight,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Place, UserProfile, Review } from '@/lib/types'
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from '@/lib/data'

interface PlaceDetailProps {
  place: Place
  userProfile: UserProfile
  onBack: () => void
  onViewMap: () => void
}

// Sample reviews
const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Marie L.',
    userCountry: 'France',
    placeId: '1',
    rating: 5,
    comment: 'Absolutely stunning! The gardens are breathtaking and the blue buildings are incredible for photos. Arrived early to avoid crowds.',
    date: '2026-04-15',
    helpful: 24,
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'James W.',
    userCountry: 'UK',
    placeId: '1',
    rating: 4,
    comment: 'Beautiful place but can get very crowded. The Berber Museum inside is worth the extra ticket. Lots of shaded areas which was nice in the heat.',
    date: '2026-04-10',
    helpful: 18,
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Sarah M.',
    userCountry: 'USA',
    placeId: '1',
    rating: 5,
    comment: 'A must-visit in Marrakech! The iconic blue color is even more vibrant in person. Great for wheelchair users too - most paths are accessible.',
    date: '2026-04-05',
    helpful: 31,
  },
]

export function PlaceDetail({ place, userProfile, onBack, onViewMap }: PlaceDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([])

  const convertPrice = (priceMAD: number): string => {
    const rate = EXCHANGE_RATES[userProfile.currency] || 1
    const converted = priceMAD * rate
    const symbol = CURRENCY_SYMBOLS[userProfile.currency] || 'MAD'
    return `${converted.toFixed(0)} ${symbol}`
  }

  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const getRelevantAlerts = () => {
    const alerts = []
    if (userProfile.sunSensitivity && !place.hasShadedAreas) {
      alerts.push({
        type: 'warning',
        message: 'This location has limited shade. Consider visiting in the morning or evening.',
      })
    }
    if (userProfile.allergies.includes('Nuts') && place.category === 'restaurant') {
      alerts.push({
        type: 'warning',
        message: 'Remember to ask about nut ingredients when ordering.',
      })
    }
    return alerts
  }

  const alerts = getRelevantAlerts()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="icon"
            onClick={onBack}
            className="bg-card/80 backdrop-blur"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="bg-card/80 backdrop-blur"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-card/80 backdrop-blur"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {place.isEcoCertified && (
            <Badge className="bg-green-500 text-white">
              <Leaf className="w-3 h-3 mr-1" />
              Eco-Certified
            </Badge>
          )}
          {place.isAccessible && (
            <Badge className="bg-blue-500 text-white">
              <Check className="w-3 h-3 mr-1" />
              Accessible
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative z-10">
        <Card>
          <CardContent className="p-6">
            {/* Title & Rating */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{place.name}</h1>
                {place.nameAr && (
                  <p className="text-sm text-muted-foreground">{place.nameAr}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold">{place.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{place.reviews.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-3 my-4">
              {place.openingHours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {place.openingHours}
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {place.address}
              </div>
            </div>

            {/* Price */}
            {place.priceMAD && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
                <span className="text-sm text-muted-foreground">Entry / Average Cost</span>
                <span className="text-lg font-bold text-primary">
                  {place.priceMAD.min === 0
                    ? 'Free'
                    : place.priceMAD.max > place.priceMAD.min
                    ? `${convertPrice(place.priceMAD.min)} - ${convertPrice(place.priceMAD.max)}`
                    : convertPrice(place.priceMAD.min)
                  }
                </span>
              </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2 mb-4">
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground mb-4">{place.description}</p>

            {/* Eco Description */}
            {place.ecoDescription && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <Leaf className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 mb-1">Eco-Responsible</p>
                    <p className="text-sm text-green-700">{place.ecoDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {place.hasShadedAreas && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Shaded Areas</span>
                </div>
              )}
              {place.isFamilyFriendly && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Family Friendly</span>
                </div>
              )}
              {place.isAccessible && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Wheelchair Access</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {place.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {place.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Reviews</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {SAMPLE_REVIEWS.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">{review.userCountry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHelpful(review.id)}
                      className={`text-xs gap-1 ${helpfulReviews.includes(review.id) ? 'text-primary' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Helpful ({review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={onViewMap}
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </Button>
          <Button className="flex-1 gap-2">
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  )
}
