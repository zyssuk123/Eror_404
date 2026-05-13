import { NextRequest, NextResponse } from 'next/server'
import { UserProfile, Place } from '@/lib/types'
import { SAMPLE_PLACES, MORE_PLACES } from '@/lib/data'

const ALL_PLACES = [...SAMPLE_PLACES, ...MORE_PLACES]

export async function POST(request: NextRequest) {
  try {
    const { userProfile } = await request.json() as { userProfile: UserProfile }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Return mock data if no API key
      return NextResponse.json({
        itinerary: generateMockItinerary(userProfile),
        message: 'Generated with sample data (configure GEMINI_API_KEY for AI generation)'
      })
    }

    // Build the prompt for Gemini
    const prompt = buildPrompt(userProfile)

    try {
      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', response.status, errorText)
        return NextResponse.json({
          itinerary: generateMockItinerary(userProfile),
          message: 'Generated with sample data (API error - using fallback)'
        })
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        return NextResponse.json({
          itinerary: generateMockItinerary(userProfile),
          message: 'Generated with sample data (empty response)'
        })
      }

      try {
        const parsedItinerary = JSON.parse(generatedText)
        
        // Enhance the AI response with real place data
        const enhancedItinerary = enhanceItineraryWithPlaceData(parsedItinerary)
        
        return NextResponse.json({
          itinerary: enhancedItinerary,
          message: 'AI-generated itinerary powered by Gemini'
        })
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        return NextResponse.json({
          itinerary: generateMockItinerary(userProfile),
          message: 'Generated with sample data (parse error)'
        })
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({
        itinerary: generateMockItinerary(userProfile),
        message: 'Generated with sample data (network error)'
      })
    }
  } catch (error) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json({
      itinerary: generateMockItinerary({ 
        tripDuration: 3, 
        budget: 'moderate',
        sunSensitivity: false,
        needsWheelchair: false,
        hasChildren: false,
        allergies: [],
        interests: ['History & Culture', 'Food & Cuisine'],
      } as UserProfile),
      message: 'Generated with sample data (server error)'
    })
  }
}

function buildPrompt(profile: UserProfile): string {
  const constraints = []

  if (profile.sunSensitivity) {
    constraints.push('- User is sensitive to sun/heat - prioritize shaded areas and suggest visiting outdoor places in morning or evening')
  }
  if (profile.mobilityIssues || profile.needsWheelchair) {
    constraints.push('- User has mobility issues - only include accessible locations without stairs or difficult terrain')
  }
  if (profile.hasChildren) {
    constraints.push('- Traveling with children - include family-friendly activities')
  }
  if (profile.hasElderly) {
    constraints.push('- Traveling with elderly - avoid locations requiring lots of walking or climbing')
  }
  if (profile.allergies && profile.allergies.length > 0) {
    constraints.push(`- User has allergies: ${profile.allergies.join(', ')} - note this for restaurant recommendations`)
  }
  if (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) {
    constraints.push(`- Dietary restrictions: ${profile.dietaryRestrictions.join(', ')}`)
  }
  if (profile.medicalConditions && profile.medicalConditions.length > 0) {
    constraints.push(`- Medical conditions: ${profile.medicalConditions.join(', ')} - recommend appropriate pace and breaks`)
  }

  // List of available places to reference
  const placeList = ALL_PLACES.map(p => ({
    name: p.name,
    nameAr: p.nameAr,
    category: p.category,
    isEcoCertified: p.isEcoCertified,
    isAccessible: p.isAccessible,
    hasShadedAreas: p.hasShadedAreas,
    isFamilyFriendly: p.isFamilyFriendly,
    priceRange: p.priceRange,
  }))

  return `You are a Marrakech tourism expert creating an eco-responsible and inclusive itinerary.
You must respond ONLY with valid JSON, no additional text.

USER PROFILE:
- Duration: ${profile.tripDuration} days
- Budget: ${profile.budget}
- Traveling: ${profile.travelingWith}
- Interests: ${profile.interests?.join(', ') || 'General sightseeing'}
- Activity Level: ${profile.activityLevel || 'moderate'}
- Preferred Time: ${profile.preferredTimes || 'flexible'}

HEALTH CONSTRAINTS:
${constraints.length > 0 ? constraints.join('\n') : '- No specific health constraints'}

AVAILABLE PLACES (use these exact names):
${JSON.stringify(placeList.slice(0, 15), null, 2)}

REQUIREMENTS:
1. Create a ${Math.min(profile.tripDuration, 5)}-day itinerary for Marrakech
2. Each day should have 3-4 activities
3. Prioritize eco-certified and locally-owned businesses when available
4. Include a mix of the user's interests
5. Consider the budget level for recommendations
6. Respect all health and accessibility constraints
7. Use ONLY the place names from the available places list above
8. Include realistic timing and travel between locations

Respond ONLY with this exact JSON structure:
{
  "days": [
    {
      "dayNumber": 1,
      "theme": "Day theme in English",
      "activities": [
        {
          "time": "09:00",
          "placeName": "Exact place name from the list",
          "placeNameAr": "Arabic name if known",
          "category": "monument|restaurant|garden|shopping|spa|rooftop|museum|riad|hotel|excursion",
          "duration": "2 hours",
          "description": "Why this place and what to do there (2-3 sentences)",
          "ecoNote": "Why this is eco-responsible if applicable",
          "tips": "Useful tips for the visitor",
          "estimatedCost": 100
        }
      ]
    }
  ],
  "totalEstimatedBudget": {
    "min": 1000,
    "max": 2000
  },
  "ecoTips": ["Array of 3-5 eco-tourism tips for the trip"]
}`
}

function enhanceItineraryWithPlaceData(itinerary: any) {
  if (!itinerary || !itinerary.days) return itinerary

  // Match activities with real place data
  itinerary.days = itinerary.days.map((day: any) => ({
    ...day,
    activities: (day.activities || []).map((activity: any) => {
      // Try to find matching place
      const matchedPlace = ALL_PLACES.find(
        p => p.name.toLowerCase().includes(activity.placeName?.toLowerCase()) ||
             activity.placeName?.toLowerCase().includes(p.name.toLowerCase())
      )

      if (matchedPlace) {
        return {
          ...activity,
          placeName: matchedPlace.name,
          placeNameAr: matchedPlace.nameAr || activity.placeNameAr,
          coordinates: matchedPlace.coordinates,
          imageUrl: matchedPlace.imageUrl,
          isEcoCertified: matchedPlace.isEcoCertified,
          isAccessible: matchedPlace.isAccessible,
          category: matchedPlace.category,
        }
      }

      return activity
    })
  }))

  return itinerary
}

function generateMockItinerary(profile: UserProfile) {
  // Filter places based on user constraints
  const suitablePlaces = ALL_PLACES.filter(place => {
    if (profile.sunSensitivity && !place.hasShadedAreas) return false
    if (profile.needsWheelchair && !place.isAccessible) return false
    if (profile.hasChildren && !place.isFamilyFriendly) return false
    return true
  })

  const days = []
  const themes = [
    'Discover the Heart of Marrakech',
    'Gardens and Serenity',
    'Art, Culture and Craftsmanship',
    'Authentic Experiences',
    'Relaxation and Wellness',
  ]

  const numDays = Math.min(profile.tripDuration || 3, 5)

  for (let i = 0; i < numDays; i++) {
    const startIndex = (i * 3) % suitablePlaces.length
    const dayPlaces = [
      suitablePlaces[startIndex],
      suitablePlaces[(startIndex + 1) % suitablePlaces.length],
      suitablePlaces[(startIndex + 2) % suitablePlaces.length],
    ].filter(Boolean)
    
    days.push({
      dayNumber: i + 1,
      theme: themes[i % themes.length],
      activities: dayPlaces.map((place, idx) => ({
        time: ['09:00', '12:30', '16:00'][idx] || '10:00',
        placeName: place.name,
        placeNameAr: place.nameAr || '',
        category: place.category,
        duration: '2-3 hours',
        description: place.description,
        ecoNote: place.ecoDescription || 'Supporting local businesses and artisans',
        tips: place.category === 'shopping' 
          ? 'Remember to negotiate - start at 50% of the asking price!'
          : `Best visited in the ${profile.sunSensitivity ? 'morning or evening' : 'afternoon'}`,
        estimatedCost: place.priceMAD?.min || 50,
        coordinates: place.coordinates,
        imageUrl: place.imageUrl,
        isEcoCertified: place.isEcoCertified,
        isAccessible: place.isAccessible,
      }))
    })
  }

  return {
    days,
    totalEstimatedBudget: {
      min: profile.budget === 'budget' ? 500 : profile.budget === 'moderate' ? 1500 : 4000,
      max: profile.budget === 'budget' ? 1000 : profile.budget === 'moderate' ? 3000 : 10000,
    },
    ecoTips: [
      'Carry a reusable water bottle - many riads offer free refills',
      'Support local artisans by buying directly from craftspeople in the souks',
      'Choose walking tours over motorized transport when possible',
      'Respect local customs and dress modestly when visiting religious sites',
      'Bring a reusable bag for shopping to avoid plastic',
    ]
  }
}
