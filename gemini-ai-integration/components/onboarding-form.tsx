'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, User, Heart, MapPin, Utensils, AlertTriangle, Check, Loader2, Shield, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/lib/types'
import { INTERESTS, DIETARY_RESTRICTIONS, LANGUAGES, MEDICAL_CONDITIONS } from '@/lib/data'
import { defaultProfile } from '@/lib/context'

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: User },
  { id: 'trip', title: 'Trip Details', icon: MapPin },
  { id: 'health', title: 'Health & Access', icon: Heart },
  { id: 'safety', title: 'Safety & Routes', icon: Shield },
  { id: 'food', title: 'Food Preferences', icon: Utensils },
  { id: 'interests', title: 'Interests', icon: AlertTriangle },
]

const COUNTRIES = [
  'France', 'United States', 'United Kingdom', 'Germany', 'Spain', 
  'Italy', 'Netherlands', 'Belgium', 'Canada', 'Australia', 'Morocco', 'Other'
]

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    onComplete(profile)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <img 
                  src="/avatars/guide-welcome.png" 
                  alt="Welcome Guide" 
                  className="w-full h-full object-contain animate-float"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Marhaba! Welcome to Yallah</h2>
              <p className="text-muted-foreground mt-2">{"Let's personalize your Marrakech adventure"}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country">Where are you from?</Label>
                <Select
                  value={profile.country}
                  onValueChange={(value) => updateProfile({ country: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred Language</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => updateProfile({ language: lang.code as UserProfile['language'] })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        profile.language === lang.code
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <p className="text-xs mt-1">{lang.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Your Currency</Label>
                <RadioGroup
                  value={profile.currency}
                  onValueChange={(value) => updateProfile({ currency: value as UserProfile['currency'] })}
                  className="flex gap-4 mt-2"
                >
                  {['EUR', 'USD', 'GBP', 'MAD'].map(curr => (
                    <div key={curr} className="flex items-center space-x-2">
                      <RadioGroupItem value={curr} id={curr} />
                      <Label htmlFor={curr}>{curr}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="trip"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Trip Details</h2>
              <p className="text-muted-foreground">Help us plan the perfect itinerary</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>How many days will you spend in Marrakech?</Label>
                <div className="flex items-center gap-4 mt-3">
                  <Slider
                    value={[profile.tripDuration]}
                    onValueChange={([value]) => updateProfile({ tripDuration: value })}
                    min={1}
                    max={14}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-primary w-16 text-center">
                    {profile.tripDuration} {profile.tripDuration === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Budget Level</Label>
                <RadioGroup
                  value={profile.budget}
                  onValueChange={(value) => updateProfile({ budget: value as UserProfile['budget'] })}
                  className="grid grid-cols-3 gap-3 mt-2"
                >
                  {[
                    { value: 'budget', label: 'Budget', desc: '< 500 MAD/day' },
                    { value: 'moderate', label: 'Moderate', desc: '500-1500 MAD/day' },
                    { value: 'luxury', label: 'Luxury', desc: '> 1500 MAD/day' },
                  ].map(option => (
                    <div key={option.value}>
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Who are you traveling with?</Label>
                <RadioGroup
                  value={profile.travelingWith}
                  onValueChange={(value) => updateProfile({ travelingWith: value as UserProfile['travelingWith'] })}
                  className="grid grid-cols-2 gap-3 mt-2"
                >
                  {[
                    { value: 'solo', label: 'Solo' },
                    { value: 'couple', label: 'Couple' },
                    { value: 'family', label: 'Family' },
                    { value: 'friends', label: 'Friends' },
                  ].map(option => (
                    <div key={option.value}>
                      <RadioGroupItem
                        value={option.value}
                        id={`travel-${option.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`travel-${option.value}`}
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {(profile.travelingWith === 'family') && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasChildren"
                      checked={profile.hasChildren}
                      onCheckedChange={(checked) => updateProfile({ hasChildren: !!checked })}
                    />
                    <Label htmlFor="hasChildren">Traveling with children</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasElderly"
                      checked={profile.hasElderly}
                      onCheckedChange={(checked) => updateProfile({ hasElderly: !!checked })}
                    />
                    <Label htmlFor="hasElderly">Traveling with elderly family members</Label>
                  </div>
                </div>
              )}

              <div>
                <Label>Activity Level</Label>
                <RadioGroup
                  value={profile.activityLevel}
                  onValueChange={(value) => updateProfile({ activityLevel: value as UserProfile['activityLevel'] })}
                  className="flex gap-3 mt-2"
                >
                  {['relaxed', 'moderate', 'active'].map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={`activity-${level}`} />
                      <Label htmlFor={`activity-${level}`} className="capitalize">{level}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="health"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Health & Accessibility</h2>
              <p className="text-muted-foreground">{"We'll adapt recommendations to your needs"}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Marrakech Climate</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Marrakech can be very hot (up to 45°C in summer). We will suggest shaded routes and cooler times for sun-sensitive visitors.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div>
                  <Label className="font-medium">Sun Sensitivity</Label>
                  <p className="text-sm text-muted-foreground">I am sensitive to heat or direct sunlight</p>
                </div>
                <Checkbox
                  checked={profile.sunSensitivity}
                  onCheckedChange={(checked) => updateProfile({ sunSensitivity: !!checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div>
                  <Label className="font-medium">Mobility Considerations</Label>
                  <p className="text-sm text-muted-foreground">I have difficulty walking long distances</p>
                </div>
                <Checkbox
                  checked={profile.mobilityIssues}
                  onCheckedChange={(checked) => updateProfile({ mobilityIssues: !!checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div>
                  <Label className="font-medium">Wheelchair Access Needed</Label>
                  <p className="text-sm text-muted-foreground">I need wheelchair-accessible locations</p>
                </div>
                <Checkbox
                  checked={profile.needsWheelchair}
                  onCheckedChange={(checked) => updateProfile({ needsWheelchair: !!checked })}
                />
              </div>
            </div>

            <div>
              <Label className="font-medium">Allergies</Label>
              <p className="text-sm text-muted-foreground mb-3">Select any allergies (we will alert you)</p>
              <div className="flex flex-wrap gap-2">
                {['Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Pollen', 'Dust'].map(allergy => (
                  <Badge
                    key={allergy}
                    variant={profile.allergies.includes(allergy) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => updateProfile({ allergies: toggleArrayItem(profile.allergies, allergy) })}
                  >
                    {profile.allergies.includes(allergy) && <Check className="w-3 h-3 mr-1" />}
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-medium">Medical Conditions</Label>
              <p className="text-sm text-muted-foreground mb-3">Help us adapt recommendations to your needs</p>
              <div className="flex flex-wrap gap-2">
                {MEDICAL_CONDITIONS.map(condition => (
                  <Badge
                    key={condition}
                    variant={profile.medicalConditions.includes(condition) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => updateProfile({ medicalConditions: toggleArrayItem(profile.medicalConditions, condition) })}
                  >
                    {profile.medicalConditions.includes(condition) && <Check className="w-3 h-3 mr-1" />}
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="safety"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4">
                <img 
                  src="/avatars/guide-monuments.png" 
                  alt="Safety Guide" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Safety & Routes</h2>
              <p className="text-muted-foreground">{"We'll find the best paths for you"}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Marrakech is Safe</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Marrakech is generally very safe for tourists. We help you avoid common scams and find the most comfortable routes.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="font-medium">Safety Priority</Label>
              <p className="text-sm text-muted-foreground mb-3">How important is safety in your route planning?</p>
              <RadioGroup
                value={profile.safetyPriority}
                onValueChange={(value) => updateProfile({ safetyPriority: value as UserProfile['safetyPriority'] })}
                className="grid grid-cols-3 gap-3 mt-2"
              >
                {[
                  { value: 'relaxed', label: 'Relaxed', desc: 'I love adventure' },
                  { value: 'moderate', label: 'Moderate', desc: 'Balanced approach' },
                  { value: 'high', label: 'High', desc: 'Safety first' },
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`safety-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`safety-${option.value}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="font-medium">Route Preference</Label>
              <p className="text-sm text-muted-foreground mb-3">How do you want to explore the Medina?</p>
              <RadioGroup
                value={profile.routePreference}
                onValueChange={(value) => updateProfile({ routePreference: value as UserProfile['routePreference'] })}
                className="space-y-3 mt-2"
              >
                {[
                  { value: 'fastest', label: 'Fastest', desc: 'Direct routes, less time walking', icon: '⚡' },
                  { value: 'safest', label: 'Safest', desc: 'Well-lit main streets with tourist police', icon: '🛡️' },
                  { value: 'scenic', label: 'Scenic', desc: 'Beautiful architecture and photo opportunities', icon: '📸' },
                  { value: 'zen', label: 'Zen (Quiet)', desc: 'Calm alleys away from crowds', icon: '🧘' },
                  { value: 'senteurs', label: 'Scent Trail', desc: 'Pass by spice merchants and herbalists', icon: '🌿' },
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`route-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`route-${option.value}`}
                      className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="food"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4">
                <img 
                  src="/avatars/guide-food.png" 
                  alt="Food Guide" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Food Preferences</h2>
              <p className="text-muted-foreground">{"Let's find the perfect dishes for you"}</p>
            </div>

            <div>
              <Label className="font-medium">Dietary Restrictions</Label>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_RESTRICTIONS.map(diet => (
                  <button
                    key={diet}
                    onClick={() => updateProfile({ 
                      dietaryRestrictions: toggleArrayItem(profile.dietaryRestrictions, diet) 
                    })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      profile.dietaryRestrictions.includes(diet)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {profile.dietaryRestrictions.includes(diet) && (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{diet}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                <strong>Good news!</strong> Moroccan cuisine offers many vegetarian and naturally gluten-free options. Traditional tagines and couscous can be adapted to most dietary needs.
              </p>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Interests</h2>
              <p className="text-muted-foreground">What would you like to experience?</p>
            </div>

            <div>
              <Label className="font-medium">Select your interests (choose at least 3)</Label>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => updateProfile({ 
                      interests: toggleArrayItem(profile.interests, interest) 
                    })}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      profile.interests.includes(interest)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{interest}</span>
                      {profile.interests.includes(interest) && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Preferred Time to Explore</Label>
              <RadioGroup
                value={profile.preferredTimes}
                onValueChange={(value) => updateProfile({ preferredTimes: value as UserProfile['preferredTimes'] })}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                {[
                  { value: 'morning', label: 'Morning (8-12h)' },
                  { value: 'afternoon', label: 'Afternoon (12-18h)' },
                  { value: 'evening', label: 'Evening (18-23h)' },
                  { value: 'flexible', label: 'Flexible' },
                ].map(option => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`time-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`time-${option.value}`}
                      className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background moroccan-pattern">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-2xl shadow-lg p-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your guide...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              <>
                Start Exploring
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
