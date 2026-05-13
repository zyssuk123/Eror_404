'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  MapPin, 
  X,
  Play,
  Pause,
  Volume2,
  Landmark,
  Crown,
  Scroll,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HistoricalStory {
  id: string
  title: string
  titleAr: string
  period: string
  year: string
  category: 'monument' | 'legend' | 'dynasty' | 'culture'
  shortDescription: string
  fullStory: string
  funFact: string
  relatedPlace?: string
  imageUrl: string
  coordinates?: [number, number]
}

const HISTORICAL_STORIES: HistoricalStory[] = [
  {
    id: 'hs1',
    title: 'The Koutoubia Mosque',
    titleAr: 'جامع الكتبية',
    period: 'Almohad Dynasty',
    year: '1147-1199 AD',
    category: 'monument',
    shortDescription: 'The iconic minaret that inspired the Giralda in Seville',
    fullStory: `The Koutoubia Mosque stands as Marrakech's most iconic landmark, its 77-meter minaret visible from almost anywhere in the city. Built during the reign of the Almohad Caliph Yaqub al-Mansur, this architectural masterpiece was actually constructed twice.

The first mosque, built in 1147 under Abd al-Mumin, was demolished because it was not precisely aligned with Mecca. The current structure was completed by 1199 and its design was so admired that it inspired both the Giralda tower in Seville and the Hassan Tower in Rabat.

The name "Koutoubia" comes from "kutubiyyin" (booksellers), as the mosque was once surrounded by a thriving book market. Legend says the copper orbs atop the minaret were made from the melted-down jewelry of Yaqub al-Mansur's wife, given as penance for breaking her fast during Ramadan.

At sunset, the call to prayer echoes across the medina, just as it has for over 850 years, making this one of the oldest continuously functioning mosques in Morocco.`,
    funFact: 'The golden orbs on top are said to be made from a queen\'s jewelry given as penance!',
    relatedPlace: 'Koutoubia Mosque',
    imageUrl: 'https://images.unsplash.com/photo-1548017257-cbb1cc92237d?w=800',
    coordinates: [31.6237, -7.9934]
  },
  {
    id: 'hs2',
    title: 'The Legend of Jemaa el-Fnaa',
    titleAr: 'أسطورة ساحة جامع الفناء',
    period: 'Almoravid Era',
    year: '11th Century',
    category: 'legend',
    shortDescription: 'The "Assembly of the Dead" - a square with a dark past',
    fullStory: `Jemaa el-Fnaa, the pulsating heart of Marrakech, has a name that sends shivers down the spine: "Assembly of the Dead." This UNESCO-recognized masterpiece of oral heritage was once a place of public executions where the heads of criminals were displayed on stakes.

But from this dark beginning emerged one of the world's most extraordinary public spaces. By day, it fills with orange juice sellers, snake charmers, and henna artists. By night, it transforms into the world's largest open-air restaurant, with over 100 food stalls serving traditional Moroccan cuisine.

The storytellers (hlaiqia) who gather here continue a tradition dating back centuries. They weave tales of sultans, djinns, and impossible loves, keeping alive an oral tradition that UNESCO declared a Masterpiece of Intangible Heritage in 2001.

One legend says that a wealthy merchant cursed the square after his son was unjustly executed here. His curse was that the square would forever be filled with noise and chaos - which some say explains the eternal buzz of activity!`,
    funFact: 'The square was UNESCO\'s first "Masterpiece of the Oral and Intangible Heritage of Humanity"',
    relatedPlace: 'Jemaa el-Fnaa',
    imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800',
    coordinates: [31.6258, -7.9891]
  },
  {
    id: 'hs3',
    title: 'Yves Saint Laurent & Majorelle',
    titleAr: 'إيف سان لوران وماجوريل',
    period: 'Modern Era',
    year: '1919-2008',
    category: 'culture',
    shortDescription: 'How a French painter and a fashion icon saved a garden',
    fullStory: `The story of Jardin Majorelle is one of art, love, and rebirth. In 1919, French painter Jacques Majorelle arrived in Marrakech seeking to cure his heart condition. Captivated by the light and colors of Morocco, he began creating a botanical garden that would become his life's masterpiece.

Majorelle spent 40 years collecting exotic plants from five continents and developing a striking cobalt blue - now known as "Majorelle Blue" - that adorns the garden's Art Deco structures. After his death in 1962, the garden fell into neglect.

Enter Yves Saint Laurent and Pierre Bergé. The legendary fashion designer first visited Marrakech in 1966 and fell under the city's spell. In 1980, hearing the garden was to be demolished for a hotel, they purchased it immediately.

Saint Laurent found creative sanctuary here, designing many of his most celebrated collections. He said, "For years, I found in this garden inexhaustible sources of inspiration." When he died in 2008, his ashes were scattered in the garden's rose beds, forever uniting the designer with his beloved paradise.`,
    funFact: 'YSL\'s ashes were scattered in the rose garden he loved so much',
    relatedPlace: 'Jardin Majorelle',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    coordinates: [31.6417, -8.0035]
  },
  {
    id: 'hs4',
    title: 'The Saadian Tombs Mystery',
    titleAr: 'سر مقابر السعديين',
    period: 'Saadian Dynasty',
    year: '1578-1603 AD',
    category: 'dynasty',
    shortDescription: 'Royal tombs hidden for 300 years',
    fullStory: `In 1917, French aerial photographers noticed something strange near the Kasbah Mosque - what appeared to be a walled garden with elaborate structures. What they discovered would become one of Marrakech's most treasured sites: the Saadian Tombs, hidden from the world for over three centuries.

Sultan Ahmad al-Mansur, the "Golden One," built these magnificent mausoleums in the late 16th century during the height of Saadian power. The craftsmanship rivals the Alhambra: cedar wood ceilings painted with gold, Italian Carrara marble, and intricate zellige tilework.

When the Alaouite dynasty took power in 1672, Sultan Moulay Ismail wanted to destroy all traces of his predecessors but feared divine retribution for disturbing royal graves. Instead, he simply walled up the tombs, leaving only a small passage through the mosque - effectively erasing them from history.

For 300 years, only locals knew of the tombs' existence, passing the secret through generations. Today, the Hall of Twelve Columns remains one of the finest examples of Islamic decorative art, where 66 members of the Saadian dynasty rest in eternal splendor.`,
    funFact: 'A rival dynasty literally walled up the tombs to erase the Saadians from history',
    relatedPlace: 'Saadian Tombs',
    imageUrl: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800',
    coordinates: [31.6197, -7.9927]
  },
  {
    id: 'hs5',
    title: 'Ben Youssef Madrasa',
    titleAr: 'مدرسة بن يوسف',
    period: 'Saadian Dynasty',
    year: '1565 AD',
    category: 'monument',
    shortDescription: 'The largest Islamic college in North Africa',
    fullStory: `For over 400 years, the Ben Youssef Madrasa echoed with the voices of students reciting the Quran, debating Islamic philosophy, and studying mathematics and astronomy. At its peak, 900 students lived and studied within these intricately decorated walls.

Founded in the 14th century but rebuilt magnificently by the Saadians in 1565, this theological college was the largest in North Africa. Students, some as young as 10, came from across the Maghreb to study here, living in 132 small dormitory cells arranged around a stunning central courtyard.

The architecture is a symphony of Moroccan craftsmanship: carved stucco, zellige tiles, and cedar wood all bear inscriptions from the Quran. The central basin, fed by the same underground channels that supplied the medina's fountains, provided water for ritual ablutions.

The madrasa closed as a religious school in 1960 but reopened as a monument in 1982. Stand in the courtyard at midday when the sun illuminates the carved plaster, and you'll understand why scholars considered this place a gateway to enlightenment.`,
    funFact: '900 students once lived in tiny cells barely big enough for a bed and books',
    relatedPlace: 'Ben Youssef Madrasa',
    imageUrl: 'https://images.unsplash.com/photo-1553522991-71439aa62779?w=800',
    coordinates: [31.6315, -7.9865]
  },
  {
    id: 'hs6',
    title: 'The Founding of Marrakech',
    titleAr: 'تأسيس مراكش',
    period: 'Almoravid Dynasty',
    year: '1062 AD',
    category: 'dynasty',
    shortDescription: 'When desert warriors built a capital from nothing',
    fullStory: `In 1062, the Almoravid leader Abu Bakr ibn Umar pitched his tent on a barren plain at the foot of the Atlas Mountains. Within decades, this simple encampment would become one of the greatest cities of the medieval world - Marrakech, the "Red City."

The Almoravids were Berber warriors from the Sahara who had united the tribes under a strict interpretation of Islam. They chose this location strategically: close to the Atlas passes, near water sources, and at the crossroads of trans-Saharan trade routes bringing gold, salt, and slaves from sub-Saharan Africa.

Abu Bakr's cousin, Yusuf ibn Tashfin, transformed the tent city into a proper capital. He built the first walls (though the current ramparts date from the 12th century), established markets, and created the underground irrigation system (khettaras) that still provides water today.

The name "Marrakech" likely comes from the Berber words "mur" (land) and "akush" (God), meaning "Land of God." For centuries, Europeans called all of Morocco "Marrakech" - the country's name in many languages still echoes this origin.`,
    funFact: 'The entire country of Morocco is named after this city!',
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    coordinates: [31.6295, -7.9811]
  },
  {
    id: 'hs7',
    title: 'El Badi Palace',
    titleAr: 'قصر البديع',
    period: 'Saadian Dynasty',
    year: '1578-1594 AD',
    category: 'monument',
    shortDescription: 'The "Incomparable Palace" that took 25 years to build',
    fullStory: `Sultan Ahmad al-Mansur built El Badi Palace to celebrate his victory over the Portuguese at the Battle of the Three Kings in 1578. The name means "The Incomparable" or "The Marvelous," and contemporary accounts suggest it lived up to its name.

Construction took 25 years and cost a fortune in sugar - Morocco's "white gold." The palace featured 360 rooms, a courtyard with a 90-meter pool, and decorations of Italian marble, Irish gold, Indian onyx, and Chinese jade. The sultan paid for it by ransoming Portuguese nobles and controlling the trans-Saharan gold trade.

Legend says that when the palace was completed, a court jester remarked, "It will make a beautiful ruin." The sultan was not amused, but the fool's words proved prophetic.

In 1672, Sultan Moulay Ismail stripped the palace of everything valuable to build his new capital in Meknes. It took 12 years to remove all the treasures. Today, only storks nesting in the massive walls remain to hint at the palace's former glory - and they've been residents for centuries.`,
    funFact: 'A court jester correctly predicted the palace would become a beautiful ruin',
    relatedPlace: 'El Badi Palace',
    imageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
    coordinates: [31.6195, -7.9862]
  },
  {
    id: 'hs8',
    title: 'The Mellah',
    titleAr: 'الملاح',
    period: 'Saadian Dynasty',
    year: '1558 AD',
    category: 'culture',
    shortDescription: 'Morocco\'s first Jewish quarter and its hidden synagogues',
    fullStory: `In 1558, Sultan Moulay Abdallah created the Mellah, Marrakech's Jewish quarter, near the royal palace. While this segregation might seem oppressive, it actually provided protection - Jews lived under the sultan's direct oversight and enjoyed relative security.

The word "Mellah" comes from the Arabic for "salt" - possibly because Jews were once tasked with salting the heads of executed criminals for display. Despite this grim origin, the Mellah became a thriving center of commerce and craftsmanship.

At its peak, over 35,000 Jews lived here, running the gold and silver trade, working as jewelers, and serving as trusted advisors to sultans. The quarter had its own synagogues, schools, and cemeteries. The architecture differs from the medina - houses have balconies facing outward and doors open directly onto streets.

Today, only a handful of Jews remain in Marrakech, but the Mellah's heritage survives. The Lazama Synagogue still holds services, and the Jewish cemetery - one of the largest in Morocco - contains tombs of revered rabbis and saints that attract pilgrims from around the world.`,
    funFact: 'The Jewish cemetery contains tombs of saints that Muslims also venerate',
    relatedPlace: 'Mellah Jewish Quarter',
    imageUrl: 'https://images.unsplash.com/photo-1548017257-cbb1cc92237d?w=800',
    coordinates: [31.6201, -7.9849]
  }
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'monument': return <Landmark className="w-4 h-4" />
    case 'legend': return <Scroll className="w-4 h-4" />
    case 'dynasty': return <Crown className="w-4 h-4" />
    case 'culture': return <Star className="w-4 h-4" />
    default: return <BookOpen className="w-4 h-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'monument': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'legend': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'dynasty': return 'bg-red-100 text-red-700 border-red-200'
    case 'culture': return 'bg-teal-100 text-teal-700 border-teal-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function HistoricalStories() {
  const [selectedStory, setSelectedStory] = useState<HistoricalStory | null>(null)

  const openGoogleMaps = (coordinates: [number, number], name: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}&query_place_id=${encodeURIComponent(name)}`,
      '_blank'
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HISTORICAL_STORIES.slice(0, 6).map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedStory(story)}
            className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
          >
            <div className="relative h-32">
              <img 
                src={story.imageUrl} 
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge className={`absolute top-2 left-2 text-xs ${getCategoryColor(story.category)}`}>
                <span className="mr-1">{getCategoryIcon(story.category)}</span>
                {story.category}
              </Badge>
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="font-semibold text-white text-sm line-clamp-1">{story.title}</h3>
                <p className="text-white/80 text-xs">{story.year}</p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground line-clamp-2">{story.shortDescription}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-primary font-medium">{story.period}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center mt-4">
        <Button variant="outline" onClick={() => setSelectedStory(HISTORICAL_STORIES[6])}>
          <BookOpen className="w-4 h-4 mr-2" />
          Explore More Stories
        </Button>
      </div>

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          {selectedStory && (
            <>
              <div className="relative h-48">
                <img 
                  src={selectedStory.imageUrl} 
                  alt={selectedStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                  onClick={() => setSelectedStory(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className={`mb-2 ${getCategoryColor(selectedStory.category)}`}>
                    <span className="mr-1">{getCategoryIcon(selectedStory.category)}</span>
                    {selectedStory.category}
                  </Badge>
                  <h2 className="text-2xl font-bold text-white">{selectedStory.title}</h2>
                  <p className="text-white/80 text-sm">{selectedStory.titleAr}</p>
                </div>
              </div>
              
              <ScrollArea className="max-h-[50vh]">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedStory.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {selectedStory.period}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    {selectedStory.fullStory.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-foreground leading-relaxed">{paragraph}</p>
                    ))}
                  </div>

                  {/* Fun Fact */}
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-primary">Fun Fact</p>
                        <p className="text-sm text-foreground">{selectedStory.funFact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Button */}
                  {selectedStory.coordinates && (
                    <Button 
                      className="w-full"
                      onClick={() => openGoogleMaps(selectedStory.coordinates!, selectedStory.relatedPlace || selectedStory.title)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Visit {selectedStory.relatedPlace || 'Location'}
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
