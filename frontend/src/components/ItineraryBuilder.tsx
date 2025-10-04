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


  // Check connection on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        await ApiService.healthCheck();
        setIsConnected(true);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

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
      
      // Check if this is a day header (supports both formats)
      if (line.startsWith('Day ') || line.startsWith('## Day ')) {
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
      
      // Check for time slot headers
      if (currentDay && (
        line.startsWith('**Morning:**') || line.startsWith('**Afternoon:**') || line.startsWith('**Evening:**') ||
        line.startsWith('- Morning:') || line.startsWith('- Afternoon:') || line.startsWith('- Evening:')
      )) {
        const timeMatch = line.match(/^\*\*(Morning|Afternoon|Evening):\*\*/) || 
                         line.match(/^- (Morning|Afternoon|Evening):/);
        if (timeMatch) {
          currentTimeSlot = timeMatch[1];
        }
      }
      
      // Parse activities under time slots
      if (currentDay && currentTimeSlot && line.startsWith('- ') && !line.startsWith('- Morning:') && !line.startsWith('- Afternoon:') && !line.startsWith('- Evening:')) {
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
          time: currentTimeSlot === "Morning" ? "09:00" : currentTimeSlot === "Afternoon" ? "14:00" : "19:00",
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

  // Get latest chat when currentChatId is null
  React.useEffect(() => {
    const getLatestChat = async () => {
      if (!currentChatId) {
        try {
          const chats = await ApiService.getChats();
          if (chats.length > 0) {
            // Get the most recent chat
            const latestChat = chats[chats.length - 1];
            console.log("Latest chat found:", latestChat.id);
            // You could set this in the context or use it directly
            // For now, we'll use it directly in the fetchPlanData function
            return latestChat.id;
          }
        } catch (error) {
          console.error('Error fetching chats:', error);
        }
      }
      return currentChatId;
    };

    getLatestChat();
  }, [currentChatId]);

  // Fetch plan data when currentChatId changes
  React.useEffect(() => {
    const fetchPlanData = async () => {
      let chatIdToUse = currentChatId;
      
      // If no currentChatId, get the latest chat
      if (!chatIdToUse) {
        try {
          const chats = await ApiService.getChats();
          if (chats.length > 0) {
            chatIdToUse = chats[chats.length - 1].id;
            console.log("Using latest chat ID:", chatIdToUse);
          }
        } catch (error) {
          console.error('Error fetching latest chat:', error);
          return;
        }
      }

      if (chatIdToUse) {
        try {
          const response = await ApiService.getChat(chatIdToUse);
          const latestMessage = response.messages[response.messages.length - 1];
          if (latestMessage && latestMessage.plan) {
            // Parse the content if it's a JSON string
            const content = typeof latestMessage.content === 'string' 
              ? JSON.parse(latestMessage.content) 
              : latestMessage.content;
            setFlightData(content[0]?.text || '');
            setHotelData(content[1]?.text || '');
            setCarRentalData(content[2]?.text || '');
            setFlightLink(content[0]?.link || '');
            setHotelLink(content[1]?.link || '');
            setCarRentalLink(content[2]?.link || '');
            setPlanData(latestMessage.plan);
            // Update itinerary with parsed plan data
            const parsedItinerary = parsePlanData(latestMessage.plan);
            setItinerary(parsedItinerary);
          }
        } catch (error) {
          console.error('Error fetching plan data:', error);
        }
      }
    };

    fetchPlanData();
  }, [currentChatId]);

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
                  <p className="text-sm text-muted-foreground mb-3">{flightData}</p>
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