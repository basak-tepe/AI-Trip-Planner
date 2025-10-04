import React, { useState } from "react";
import { Calendar, MapPin, Clock, Lock, Unlock, Plus, Trash2, DollarSign, Star, Hotel, Plane, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useLanguage } from "../contexts/LanguageContext";
import { useChat } from "../contexts/ChatContext";
import { ApiService } from "../services/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { detectAirlineBrand, airlineBrandLogoSrc } from "./ui/utils";

const mockItinerary = [
  {
    day: 1,
    activities: [
      { time: "09:00", name: "Arrive at Airport", location: "Bangkok Airport", locked: true, cost: 0 },
      { time: "11:00", name: "Check-in at Hotel", location: "Downtown Bangkok", locked: false, cost: 150 },
      { time: "14:00", name: "Visit Grand Palace", location: "Old City", locked: true, cost: 15 },
      { time: "18:00", name: "Street Food Tour", location: "Khao San Road", locked: false, cost: 25 },
    ],
  },
  {
    day: 2,
    activities: [
      { time: "08:00", name: "Floating Market", location: "Damnoen Saduak", locked: false, cost: 40 },
      { time: "13:00", name: "Lunch at Local Restaurant", location: "Riverside", locked: false, cost: 20 },
      { time: "15:00", name: "Temple Hopping", location: "Wat Pho & Wat Arun", locked: true, cost: 10 },
      { time: "19:00", name: "Rooftop Bar Experience", location: "Sky Bar", locked: false, cost: 50 },
    ],
  },
];

const mockAccommodations = [
  {
    name: "The Siam Hotel",
    type: "Luxury Hotel",
    rating: 4.8,
    price: 250,
    location: "Riverside, Bangkok",
    amenities: ["Pool", "Spa", "Restaurant", "Free WiFi"],
    selected: true,
  },
  {
    name: "Lub d Bangkok Silom",
    type: "Hostel",
    rating: 4.5,
    price: 45,
    location: "Silom, Bangkok",
    amenities: ["Rooftop Bar", "Free Breakfast", "Shared Kitchen"],
    selected: false,
  },
  {
    name: "Anantara Siam Bangkok",
    type: "5-Star Resort",
    rating: 4.9,
    price: 380,
    location: "Central Bangkok",
    amenities: ["Infinity Pool", "Fine Dining", "Spa", "Gym"],
    selected: false,
  },
];

const mockAlternativeActivities = {
  1: [
    { time: "14:00", name: "Jim Thompson House Museum", location: "Central Bangkok", cost: 10 },
    { time: "14:00", name: "Chatuchak Weekend Market", location: "North Bangkok", cost: 5 },
    { time: "18:00", name: "Chao Phraya Dinner Cruise", location: "River", cost: 60 },
  ],
  2: [
    { time: "08:00", name: "Bike Tour Old City", location: "Historical District", cost: 35 },
    { time: "08:00", name: "Thai Cooking Class", location: "Sukhumvit", cost: 50 },
    { time: "19:00", name: "Muay Thai Boxing Match", location: "Lumpinee Stadium", cost: 45 },
  ],
};

export function ItineraryBuilder() {
  const [budget, setBudget] = useState([2000]);
  const [tripDays, setTripDays] = useState(5);
  const [itinerary, setItinerary] = useState(mockItinerary);
  const [isConnected, setIsConnected] = useState(false);
  const [accommodations, setAccommodations] = useState(mockAccommodations);
  const { currentChatId } = useChat();
  console.log("CURRENT CHAT ID: ", currentChatId);
  const { t } = useLanguage();


  // Connection checks are triggered manually by user action

  // State for plan data
  const [planData, setPlanData] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState<string | null>(null);
  const [carRentalData, setCarRentalData] = useState<string | null>(null);
  const [flightLink, setFlightLink] = useState<string | null>(null);
  const [hotelLink, setHotelLink] = useState<string | null>(null);
  const [carRentalLink, setCarRentalLink] = useState<string | null>(null);

  // Function to parse plan data and convert to itinerary format
  const parsePlanData = (planText: string) => {
    if (!planText) return mockItinerary;

    const days: { day: number; activities: any[] }[] = [];
    const lines = planText.split('\n');
    let currentDay: { day: number; activities: any[] } | null = null;
    let dayNumber = 1;
    let currentTimeSlot: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a day header (supports EN and Turkish formats)
      const isDayHeader = (
        line.startsWith('Day ') ||
        line.startsWith('## Day ') ||
        line.startsWith('### ') // e.g., "### 13 Ekim (Pazartesi) ..."
      );
      if (isDayHeader) {
        // Save previous day if exists
        if (currentDay && currentDay.activities.length > 0) {
          days.push(currentDay);
        }
        
        // Start new day
        currentDay = {
          day: dayNumber,
          activities: []
        };
        dayNumber++;
        currentTimeSlot = null;
      }
      
      // Check for time slot headers (EN + TR)
      if (currentDay && (
        line.startsWith('**Morning:**') || line.startsWith('**Afternoon:**') || line.startsWith('**Evening:**') ||
        line.startsWith('- Morning:') || line.startsWith('- Afternoon:') || line.startsWith('- Evening:') ||
        line.startsWith('**Sabah:**') || line.startsWith('**Öğlen:**') || line.startsWith('**Öğle:**') || line.startsWith('**Akşam:**') ||
        line.startsWith('- Sabah:') || line.startsWith('- Öğlen:') || line.startsWith('- Öğle:') || line.startsWith('- Akşam:')
      )) {
        const timeMatch = line.match(/^\*\*(Morning|Afternoon|Evening|Sabah|Öğlen|Öğle|Akşam):\*\*/) || 
                         line.match(/^- (Morning|Afternoon|Evening|Sabah|Öğlen|Öğle|Akşam):/);
        if (timeMatch) {
          currentTimeSlot = timeMatch[1];
        }
      }
      
      // Parse activities under time slots
      if (currentDay && currentTimeSlot && line.startsWith('- ') &&
          !line.startsWith('- Morning:') && !line.startsWith('- Afternoon:') && !line.startsWith('- Evening:') &&
          !line.startsWith('- Sabah:') && !line.startsWith('- Öğlen:') && !line.startsWith('- Öğle:') && !line.startsWith('- Akşam:')) {
        const activity = line.substring(2).trim(); // Remove the "- " prefix
        
        // Extract location from activity text
        let location = "Various locations";
        const locationPatterns = [
          /at\s+([A-Z][^,]+)/,
          /in\s+([A-Z][^,]+)/,
          /to\s+([A-Z][^,]+)/,
          /([A-Z][a-z]+\s+[A-Z][a-z]+)/ // General location pattern
        ];
        
        for (const pattern of locationPatterns) {
          const match = activity.match(pattern);
          if (match) {
            location = match[1].trim();
            break;
          }
        }
        
        currentDay.activities.push({
          time: (
            currentTimeSlot === "Morning" || currentTimeSlot === "Sabah"
          ) ? "09:00" : (
            currentTimeSlot === "Afternoon" || currentTimeSlot === "Öğlen" || currentTimeSlot === "Öğle"
          ) ? "14:00" : "19:00",
          name: activity.split('.')[0].trim(),
          location: location,
          locked: false,
        });
      }
    }
    
    // Add the last day
    if (currentDay && currentDay.activities.length > 0) {
      days.push(currentDay);
    }

    return days.length > 0 ? days : mockItinerary;
  };

  // Accept structured plan too: [{day_number, hour, activity_title, activity_content}]
  const parseStructuredPlan = (items: any[]): { day: number; activities: any[] }[] => {
    if (!Array.isArray(items)) return mockItinerary;
    const byDay = new Map<number, any[]>();
    for (const it of items) {
      const d = typeof it.day_number === 'number' ? it.day_number : 1;
      const entry = {
        time: it.hour || '09:00',
        name: it.activity_title || 'Activity',
        location: it.activity_content || '',
        locked: false,
      };
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(entry);
    }
    const days: { day: number; activities: any[] }[] = [];
    [...byDay.keys()].sort((a, b) => a - b).forEach((d) => {
      days.push({ day: d, activities: byDay.get(d)! });
    });
    return days.length ? days : mockItinerary;
  };

  // No automatic chat selection; handled on button click

  // No automatic fetching; handled on button click

  // No polling; updates triggered only by user action

  // Manual fetch handler
  const handleLoadLatestPlan = async () => {
    try {
      // optional: health check when button is clicked
      await ApiService.healthCheck().catch(() => {});

      let chatIdToUse = currentChatId;
      if (!chatIdToUse) {
        const chats = await ApiService.getChats();
        if (chats.length > 0) {
          const latest = [...chats].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
          chatIdToUse = latest.id;
        }
      }
      if (!chatIdToUse) return;

      const response = await ApiService.getChat(chatIdToUse);
      const messages = response.messages || [];
      const lastWithPlan = [...messages]
        .reverse()
        .find((m: any) => m && m.role === 'assistant' && m.plan);
      if (!lastWithPlan) return;

      let content: any = (lastWithPlan as any).content;
      try {
        if (typeof content === 'string') {
          content = JSON.parse(content);
        }
      } catch {}

      setFlightData(content?.[0]?.text || '');
      setHotelData(content?.[1]?.text || '');
      setCarRentalData(content?.[2]?.text || '');
      setFlightLink(content?.[0]?.link || '');
      setHotelLink(content?.[1]?.link || '');
      setCarRentalLink(content?.[2]?.link || '');
      const planField: any = (lastWithPlan as any).plan;
      if (Array.isArray(planField)) {
        setPlanData(JSON.stringify(planField));
        setItinerary(parseStructuredPlan(planField));
      } else if (typeof planField === 'string') {
        setPlanData(planField);
        setItinerary(parsePlanData(planField));
      }
    } catch (error) {
      console.error('Error loading latest plan:', error);
    }
  };

  console.log("PLAN DATA: ", planData);
  console.log("FLIGHT DATA: ", flightData);
  console.log("HOTEL DATA: ", hotelData);
  console.log("CAR RENTAL DATA: ", carRentalData);
  console.log("FLIGHT LINK: ", flightLink);
  console.log("HOTEL LINK: ", hotelLink);
  console.log("CAR RENTAL LINK: ", carRentalLink);

  const toggleLock = (dayIndex: number, activityIndex: number) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities[activityIndex].locked = 
      !newItinerary[dayIndex].activities[activityIndex].locked;
    setItinerary(newItinerary);
  };

  const selectAccommodation = (index: number) => {
    const newAccommodations = accommodations.map((acc, i) => ({
      ...acc,
      selected: i === index,
    }));
    setAccommodations(newAccommodations);
  };


  return (
    <section id="itinerary" className="py-20 bg-gradient-to-b from-background to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
            {t('itinerary.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('itinerary.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flight, Hotel, and Car Rental Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={handleLoadLatestPlan}>
                Load Latest Plan
              </Button>
            </div>
            {/* Flight Information */}
            {flightData && (
              <Card>
            <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Flight Details
                  </CardTitle>
            </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground mr-3 flex-1">{flightData}</p>
                    {(() => {
                      const brand = detectAirlineBrand(flightData);
                      const logo = airlineBrandLogoSrc(brand);
                      if (!logo) return null;
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="shrink-0 w-10 h-10 rounded-md border flex items-center justify-center bg-white/60 hover:bg-white">
                              <img src={logo} alt="Airline logo" className="max-w-8 max-h-8" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {brand === 'thy' ? 'Turkish Airlines' : brand === 'ajet' ? 'AJet' : 'Pegasus'}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </div>
                  {flightLink && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={flightLink} target="_blank" rel="noopener noreferrer">
                        View Flight Details
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hotel Information */}
            {hotelData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-primary" />
                    Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{hotelData}</p>
                  {hotelLink && (
                    <div className="mt-3">
                      <img 
                        src={hotelLink} 
                        alt="Hotel details" 
                        className="w-full h-32 object-cover rounded-lg"
                />
              </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Car Rental Information */}
            {carRentalData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Car Rental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{carRentalData}</p>
                  {carRentalLink && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={carRentalLink} target="_blank" rel="noopener noreferrer">
                        View Transportation Options
                      </a>
              </Button>
                  )}
            </CardContent>
          </Card>
            )}
          </div>

          {/* Itinerary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle>Your Itinerary</CardTitle>
                {planData && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {itinerary.map((day, dayIndex) => (
                  <div key={dayIndex}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                        {day.day}
                      </div>
                      <div>
                        <h3>Day {day.day}</h3>
                        <p className="text-sm text-muted-foreground">
                          {day.activities.length} activities
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 ml-6 border-l-2 border-primary/20 pl-6">
                      {day.activities.map((activity, activityIndex) => (
                        <div
                          key={activityIndex}
                          className="relative bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm">{activity.time}</span>
                                <Badge variant="outline" className="ml-2">
                                  $$$
                                </Badge>
                              </div>
                              <h4 className="mb-1">{activity.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{activity.location}</span>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleLock(dayIndex, activityIndex)}
                              className="flex-shrink-0"
                            >
                              {activity.locked ? (
                                <Lock className="w-4 h-4 text-primary" />
                              ) : (
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}