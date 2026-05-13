'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Star, 
  Heart,
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  DollarSign,
  Clock,
  Navigation,
  BookOpen,
  History,
  Landmark,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserProfile, Place, PlaceCategory } from '@/lib/types'
import { CATEGORIES, SAMPLE_PLACES, SAMPLE_ALERTS, EXCHANGE_RATES, CURRENCY_SYMBOLS, MORE_PLACES } from '@/lib/data'
import { SmartFeatures } from './smart-features'
import { HistoricalStories } from './historical-stories'

interface DashboardProps {
  userProfile: UserProfile
  onNavigate: (view: string, data?: unknown) => void
}

export function Dashboard({ userProfile, onNavigate }: DashboardProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [readAlerts, setReadAlerts] = useState<string[]>([])
  const allPlaces = [...SAMPLE_PLACES, ...MORE_PLACES]

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

  const getRelevantAlerts = () => {
    return SAMPLE_ALERTS.filter(alert => {
      if (!alert.relevantTo) return true
      if (userProfile.sunSensitivity && alert.relevantTo.includes('sun-sensitive')) return true
      if (userProfile.allergies.includes('Nuts') && alert.relevantTo.includes('allergic-nuts')) return true
      return !alert.relevantTo.length
    })
  }

  const getRecommendedPlaces = (): Place[] => {
    return allPlaces.filter(place => {
      // Filter based on user preferences
      if (userProfile.sunSensitivity && !place.hasShadedAreas) return false
      if (userProfile.needsWheelchair && !place.isAccessible) return false
      if (userProfile.hasChildren && !place.isFamilyFriendly) return false
      return true
    }).slice(0, 6)
  }

  const getCategoryAvatar = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    if (!category) return '/avatars/guide-welcome.png'
    return `/avatars/guide-${category.avatar}.png`
  }

  const alerts = getRelevantAlerts()
  const recommendedPlaces = getRecommendedPlaces()
  const unreadAlerts = alerts.filter(alert => !readAlerts.includes(alert.id))

  const markAlertAsRead = (alertId: string) => {
    setReadAlerts(prev => [...prev, alertId])
  }

  const markAllAlertsAsRead = () => {
    setReadAlerts(alerts.map(a => a.id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Yallah" 
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  Marhaba, <span className="font-semibold text-foreground">{userProfile.name || 'Traveler'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Alerts */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadAlerts.length}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 pb-6 border-b">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{userProfile.name || 'Traveler'}</p>
                        <p className="text-sm text-muted-foreground">{userProfile.country}</p>
                      </div>
                    </div>

                    <nav className="flex-1 py-6 space-y-2">
                      <button 
                        onClick={() => { onNavigate('itinerary'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span>AI Itinerary</span>
                      </button>
                      <button 
                        onClick={() => { onNavigate('map'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>Explore Map</span>
                      </button>
                      <button 
                        onClick={() => { onNavigate('favorites'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Heart className="w-5 h-5 text-primary" />
                        <span>My Favorites</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        <span>Settings</span>
                      </button>
                    </nav>

                    <div className="pt-6 border-t">
                      <Button variant="outline" className="w-full gap-2">
                        <LogOut className="w-4 h-4" />
                        Restart Guide
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <section>
            <div className="space-y-3">
              {alerts.slice(0, 2).map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border flex gap-3 ${
                    alert.severity === 'warning' 
                      ? 'bg-amber-50 border-amber-200' 
                      : alert.severity === 'danger'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-teal-50 border-teal-200'
                  }`}
                >
                  <Bell className={`w-5 h-5 flex-shrink-0 ${
                    alert.severity === 'warning' 
                      ? 'text-amber-600' 
                      : alert.severity === 'danger'
                      ? 'text-red-600'
                      : 'text-teal-600'
                  }`} />
                  <div>
                    <p className={`font-medium text-sm ${
                      alert.severity === 'warning' 
                        ? 'text-amber-800' 
                        : alert.severity === 'danger'
                        ? 'text-red-800'
                        : 'text-teal-800'
                    }`}>{alert.title}</p>
                    <p className={`text-xs mt-1 ${
                      alert.severity === 'warning' 
                        ? 'text-amber-700' 
                        : alert.severity === 'danger'
                        ? 'text-red-700'
                        : 'text-teal-700'
                    }`}>{alert.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions - AI Generator */}
        <section>
          <motion.button
            onClick={() => onNavigate('itinerary')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 text-left relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
              <img 
                src="/avatars/guide-welcome.png" 
                alt="" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">AI-Powered</span>
              </div>
              <h3 className="text-xl font-bold mb-1">Generate Your Perfect Itinerary</h3>
              <p className="text-sm opacity-90 mb-4">
                Get a personalized {userProfile.tripDuration}-day eco-friendly circuit based on your preferences
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {userProfile.tripDuration} days
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {userProfile.budget}
                </span>
                <ChevronRight className="w-5 h-5 ml-auto" />
              </div>
            </div>
          </motion.button>
        </section>

        {/* Smart Features - New! */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Smart Tools</h2>
              <p className="text-sm text-muted-foreground">Special features to enhance your trip</p>
            </div>
          </div>
          <SmartFeatures profile={userProfile} />
        </section>

        {/* Categories with Avatars */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Explore Marrakech</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('map')}>
              View Map
              <MapPin className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.slice(0, 5).map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate('explore', category.id)}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <img 
                    src={getCategoryAvatar(category.id)}
                    alt={category.label}
                    className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <p className="font-medium text-sm text-foreground">{category.label}</p>
                <p className="text-xs text-muted-foreground">{category.labelAr}</p>
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
            {CATEGORIES.slice(5).map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 5) * 0.1 }}
                onClick={() => onNavigate('explore', category.id)}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <img 
                    src={getCategoryAvatar(category.id)}
                    alt={category.label}
                    className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <p className="font-medium text-sm text-foreground">{category.label}</p>
                <p className="text-xs text-muted-foreground">{category.labelAr}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recommended For You */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recommended For You</h2>
              <p className="text-sm text-muted-foreground">Based on your preferences and health needs</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-40">
                  <img 
                    src={place.imageUrl} 
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => toggleFavorite(place.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur rounded-full flex items-center justify-center transition-colors hover:bg-card"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(place.id) ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                  </button>
                  {place.isEcoCertified && (
                    <Badge className="absolute top-3 left-3 bg-teal-500/90 text-white text-xs">
                      Eco-Certified
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground line-clamp-1">{place.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{place.rating}</span>
                    </div>
                  </div>
                  {place.nameAr && (
                    <p className="text-xs text-muted-foreground mb-2">{place.nameAr}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{place.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {place.hasShadedAreas && (
                        <Badge variant="outline" className="text-xs">Shaded</Badge>
                      )}
                      {place.isAccessible && (
                        <Badge variant="outline" className="text-xs">Accessible</Badge>
                      )}
                    </div>
                    {place.priceMAD && (
                      <span className="text-sm font-medium text-primary">
                        {convertPrice(place.priceMAD.min)}
                        {place.priceMAD.max > place.priceMAD.min && `+`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Price Reference */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Price Guide</h2>
          <p className="text-sm text-muted-foreground mb-4">Fair prices in Marrakech to avoid being overcharged</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { item: 'Orange Juice', price: 10 },
              { item: 'Petit Taxi', price: 35 },
              { item: 'Tagine', price: 80 },
              { item: 'Mint Tea', price: 15 },
            ].map(item => (
              <div key={item.item} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">{item.item}</p>
                <p className="text-lg font-bold text-primary">{convertPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Stories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Discover Marrakech&apos;s History
              </h2>
              <p className="text-sm text-muted-foreground">Stories and legends of the Red City</p>
            </div>
          </div>
          <HistoricalStories />
        </section>
      </main>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </span>
              {unreadAlerts.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAlertsAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      readAlerts.includes(alert.id) ? 'opacity-60' : ''
                    } ${
                      alert.severity === 'warning' 
                        ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
                        : alert.severity === 'danger'
                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                        : 'bg-teal-50 border-teal-200 hover:bg-teal-100'
                    }`}
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        readAlerts.includes(alert.id) ? 'bg-gray-300' :
                        alert.severity === 'warning' 
                          ? 'bg-amber-500' 
                          : alert.severity === 'danger'
                          ? 'bg-red-500'
                          : 'bg-teal-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className={`font-medium text-sm ${
                            alert.severity === 'warning' 
                              ? 'text-amber-800' 
                              : alert.severity === 'danger'
                              ? 'text-red-800'
                              : 'text-teal-800'
                          }`}>{alert.title}</p>
                          <Badge variant="outline" className="text-xs ml-2">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className={`text-xs mt-1 ${
                          alert.severity === 'warning' 
                            ? 'text-amber-700' 
                            : alert.severity === 'danger'
                            ? 'text-red-700'
                            : 'text-teal-700'
                        }`}>{alert.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 p-2 text-primary"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Explore</span>
          </button>
          <button 
            onClick={() => onNavigate('map')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <Navigation className="w-5 h-5" />
            <span className="text-xs">Map</span>
          </button>
          <button 
            onClick={() => onNavigate('itinerary')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">AI Guide</span>
          </button>
          <button 
            onClick={() => onNavigate('favorites')}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
