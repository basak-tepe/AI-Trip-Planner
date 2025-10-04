import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Lock, Unlock, Plus, Trash2, DollarSign, Star, Hotel, Plane, Sparkles, Download } from "lucide-react";
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
import { detectAirlineBrand, airlineBrandLogoSrc, detectCityImageFromTexts } from "./ui/utils";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const mockFlightData = {
  airline: "Turkish Airlines",
  flight: "TK 1234",
  route: "Istanbul → Bangkok",
  departure: "08:30",
  arrival: "14:45",
  duration: "9h 15m",
  price: "€450",
  logo: "/assets/thy.png"
};

const mockHotelData = {
  name: "The Siam Hotel",
  type: "Luxury Hotel",
  rating: 4.8,
  price: "€250/night",
  location: "Riverside, Bangkok",
  amenities: ["Pool", "Spa", "Restaurant", "Free WiFi"],
  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
};

const mockCarRentalData = {
  company: "Avis",
  vehicle: "Toyota Camry",
  type: "Mid-size Sedan",
  price: "€45/day",
  features: ["Automatic", "Air Conditioning", "GPS", "Unlimited Mileage"],
  pickup: "Bangkok Airport",
  image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d"
};

export function ItineraryBuilder() {
  const [budget, setBudget] = useState([2000]);
  const [tripDays, setTripDays] = useState(5);
  const [itinerary, setItinerary] = useState(mockItinerary);
  const [isConnected, setIsConnected] = useState(false);
  const [accommodations, setAccommodations] = useState(mockAccommodations);
  const { currentChatId, setOnMessageSent } = useChat();
  const { t } = useLanguage();

  // Register refetch callback when component mounts
  useEffect(() => {
    setOnMessageSent(() => handleLoadLatestPlan);

    // Cleanup function
    return () => {
      setOnMessageSent(undefined);
    };
  }, [setOnMessageSent]);

  // Connection checks are triggered manually by user action

  // State for plan data
  const [planData, setPlanData] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState<string | null>(null);
  const [carRentalData, setCarRentalData] = useState<string | null>(null);
  const [flightLink, setFlightLink] = useState<string | null>(null);
  const [hotelLink, setHotelLink] = useState<string | null>(null);
  const [carRentalLink, setCarRentalLink] = useState<string | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

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
      setIsLoadingPlan(true);
      
      // optional: health check when button is clicked
      await ApiService.healthCheck().catch(() => { });

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
      } catch { }

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
    } finally {
      setIsLoadingPlan(false);
    }
  };

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

  // Download functions
  const downloadAsExcel = () => {
    const worksheetData: (string | number)[][] = [];
    
    // Add header
    worksheetData.push(['Day', 'Time', 'Activity', 'Location', 'Status']);
    
    // Add itinerary data
    itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        worksheetData.push([
          `Day ${day.day}`,
          activity.time,
          activity.name,
          activity.location,
          activity.locked ? 'Locked' : 'Flexible'
        ]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Itinerary');
    
    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `Travel_Itinerary_${today}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  const downloadAsPDF = async () => {
    try {
      // Create a hidden iframe for silent PDF generation
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Generate HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Travel Itinerary</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
            }
            .day-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .day-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding: 10px;
              background: #f3f4f6;
              border-radius: 8px;
            }
            .day-number {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              margin-right: 15px;
            }
            .day-info h3 {
              margin: 0;
              font-size: 18px;
              color: #1f2937;
            }
            .day-info p {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #6b7280;
            }
            .activity {
              margin-bottom: 15px;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: white;
            }
            .activity-header {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .activity-time {
              font-weight: bold;
              color: #3b82f6;
              margin-right: 10px;
            }
            .activity-status {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-locked {
              background: #fef3c7;
              color: #92400e;
            }
            .status-flexible {
              background: #d1fae5;
              color: #065f46;
            }
            .activity-name {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .activity-location {
              font-size: 14px;
              color: #6b7280;
              display: flex;
              align-items: center;
            }
            .location-icon {
              margin-right: 5px;
            }
            .flight-info, .hotel-info, .car-info {
              margin-bottom: 20px;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f9fafb;
            }
            .info-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .info-content {
              font-size: 14px;
              color: #6b7280;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .day-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Travel Itinerary</div>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          ${flightData ? `
            <div class="flight-info">
              <div class="info-title">✈️ Flight Details</div>
              <div class="info-content">${flightData}</div>
            </div>
          ` : ''}
          
          ${hotelData ? `
            <div class="hotel-info">
              <div class="info-title">🏨 Accommodation</div>
              <div class="info-content">${hotelData}</div>
            </div>
          ` : ''}
          
          ${carRentalData ? `
            <div class="car-info">
              <div class="info-title">🚗 Car Rental</div>
              <div class="info-content">${carRentalData}</div>
            </div>
          ` : ''}
          
          ${itinerary.map(day => `
            <div class="day-section">
              <div class="day-header">
                <div class="day-number">${day.day}</div>
                <div class="day-info">
                  <h3>Day ${day.day}</h3>
                  <p>${day.activities.length} activities</p>
                </div>
              </div>
              
              ${day.activities.map(activity => `
                <div class="activity">
                  <div class="activity-header">
                    <span class="activity-time">${activity.time}</span>
                    <span class="activity-status ${activity.locked ? 'status-locked' : 'status-flexible'}">
                      ${activity.locked ? '🔒 Locked' : '🔓 Flexible'}
                    </span>
                  </div>
                  <div class="activity-name">${activity.name}</div>
                  <div class="activity-location">
                    <span class="location-icon">📍</span>
                    ${activity.location}
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
        </html>
      `;

      // Write content to iframe
      iframe.contentDocument?.write(htmlContent);
      iframe.contentDocument?.close();

      // Wait for content to load, then trigger print
      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.print();
          }
          // Clean up the iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Google Calendar export function
  const exportToGoogleCalendar = () => {
    try {
      // Get current date for the trip start
      const today = new Date();
      const tripStartDate = new Date(today.getTime() + (24 * 60 * 60 * 1000)); // Start tomorrow
      
      // Create events for each day
      const events: Array<{
        title: string;
        details: string;
        location: string;
        start: string;
        end: string;
      }> = [];
      
      itinerary.forEach((day, dayIndex) => {
        const dayDate = new Date(tripStartDate.getTime() + (dayIndex * 24 * 60 * 60 * 1000));
        
        day.activities.forEach((activity, activityIndex) => {
          // Parse time and create datetime
          const [hours, minutes] = activity.time.split(':').map(Number);
          const activityDate = new Date(dayDate);
          activityDate.setHours(hours, minutes, 0, 0);
          
          // Create end time (1 hour duration by default)
          const endDate = new Date(activityDate.getTime() + (60 * 60 * 1000));
          
          // Format dates for Google Calendar
          const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          };
          
          const event = {
            title: activity.name,
            details: `📍 ${activity.location}\n\n${activity.locked ? '🔒 Locked Activity' : '🔓 Flexible Activity'}`,
            location: activity.location,
            start: formatDate(activityDate),
            end: formatDate(endDate)
          };
          
          events.push(event);
        });
      });
      
      // Create Google Calendar URL
      const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
      
      // For now, create a single event with all activities as description
      // In a real implementation, you might want to create multiple events
      const firstEvent = events[0];
      if (firstEvent) {
        const allActivities = events.map((event, index) => 
          `${event.start.split('T')[1].substring(0, 5)} - ${event.title} (${event.location})`
        ).join('\n');
        
        const eventTitle = `Travel Itinerary - Day 1`;
        const eventDetails = `Travel Itinerary\n\n${allActivities}`;
        const eventLocation = events[0].location;
        
        const params = new URLSearchParams({
          text: eventTitle,
          details: eventDetails,
          location: eventLocation,
          dates: `${firstEvent.start}/${firstEvent.end}`
        });
        
        const googleCalendarUrl = `${baseUrl}&${params.toString()}`;
        
        // Open Google Calendar in new tab
        window.open(googleCalendarUrl, '_blank');
      } else {
        alert('No activities found to export to Google Calendar.');
      }
      
    } catch (error) {
      console.error('Error exporting to Google Calendar:', error);
      alert('Error exporting to Google Calendar. Please try again.');
    }
  };


  return (
    <section id="itinerary" className="py-20 bg-gradient-to-b from-background to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center">
            <Button 
              variant="default" 
              onClick={handleLoadLatestPlan} 
              disabled={isLoadingPlan}
              className="px-24 py-10 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-black font-semibold min-w-[400px] text-sm disabled:opacity-50"
            >
              {isLoadingPlan ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2" />
                  {t("itinerary.loading")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />&nbsp;&nbsp;{t("itinerary.loadLatestPlan")}&nbsp;&nbsp;
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flight, Hotel, and Car Rental Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Flight Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  {t("itinerary.flightDetails")}
                  {!flightData && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t("itinerary.example")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlan ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 shimmer rounded w-3/4 mb-2"></div>
                        <div className="h-3 shimmer rounded w-1/2 mb-2"></div>
                        <div className="flex gap-4">
                          <div className="h-3 shimmer rounded w-20"></div>
                          <div className="h-3 shimmer rounded w-20"></div>
                          <div className="h-3 shimmer rounded w-20"></div>
                        </div>
                      </div>
                      <div className="w-10 h-10 shimmer rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 shimmer rounded w-16"></div>
                      <div className="h-8 shimmer rounded w-24"></div>
                    </div>
                  </div>
                ) : flightData ? (
                  <>
                    <div className="flex items-center gap-4 mb-3">
                      <p className="text-sm text-muted-foreground flex-1 max-w-[60%]">{flightData}</p>
                      {(() => {
                        const brand = detectAirlineBrand(flightData);
                        const logo = airlineBrandLogoSrc(brand);
                        if (!logo) return null;
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="shrink-0 w-10 h-10 rounded-md border flex items-center justify-center bg-white/60 hover:bg-white">
                                <img src={logo} alt="Airline logo" className="max-w-8 max-h-8 rounded-md" />
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
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1 max-w-[60%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{mockFlightData.airline}</span>
                          <span className="text-sm text-muted-foreground">{mockFlightData.flight}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{mockFlightData.route}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Departure: {mockFlightData.departure}</span>
                          <span>Arrival: {mockFlightData.arrival}</span>
                          <span>Duration: {mockFlightData.duration}</span>
                        </div>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-md border flex items-center justify-center bg-white/60">
                        <img src={mockFlightData.logo} alt="Turkish Airlines logo" className="max-w-8 max-h-8" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{mockFlightData.price}</span>
                      <Button variant="outline" size="sm" className="text-xs">
                        Book Flight
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Hotel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-primary" />
                  {t("itinerary.accommodation")}
                  {!hotelData && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t("itinerary.example")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlan ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 shimmer rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 shimmer rounded w-3/4 mb-2"></div>
                        <div className="h-3 shimmer rounded w-1/2 mb-2"></div>
                        <div className="h-3 shimmer rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 shimmer rounded w-20"></div>
                      <div className="h-8 shimmer rounded w-24"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 shimmer rounded w-16"></div>
                      <div className="h-6 shimmer rounded w-12"></div>
                      <div className="h-6 shimmer rounded w-20"></div>
                    </div>
                  </div>
                ) : hotelData ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={mockHotelData.image}
                        alt={mockHotelData.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{mockHotelData.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">{mockHotelData.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{mockHotelData.type}</p>
                        <p className="text-xs text-muted-foreground">{mockHotelData.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">{mockHotelData.price}</span>
                      <Button variant="outline" size="sm" className="text-xs">
                        Book Hotel
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mockHotelData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Car Rental Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  {t("itinerary.carRental")}
                  {!carRentalData && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t("itinerary.example")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlan ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 shimmer rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 shimmer rounded w-3/4 mb-2"></div>
                        <div className="h-3 shimmer rounded w-1/2 mb-2"></div>
                        <div className="h-3 shimmer rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 shimmer rounded w-20"></div>
                      <div className="h-8 shimmer rounded w-20"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 shimmer rounded w-16"></div>
                      <div className="h-6 shimmer rounded w-20"></div>
                      <div className="h-6 shimmer rounded w-12"></div>
                    </div>
                  </div>
                ) : carRentalData ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">{carRentalData}</p>
                    {carRentalLink && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={carRentalLink} target="_blank" rel="noopener noreferrer">
                          View Transportation Options
                        </a>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={mockCarRentalData.image}
                        alt={mockCarRentalData.vehicle}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{mockCarRentalData.vehicle}</h4>
                          <span className="text-xs text-muted-foreground">{mockCarRentalData.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{mockCarRentalData.company}</p>
                        <p className="text-xs text-muted-foreground">Pickup: {mockCarRentalData.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">{mockCarRentalData.price}</span>
                      <Button variant="outline" size="sm" className="text-xs">
                        Book Car
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mockCarRentalData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Itinerary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {t("itinerary.yourItinerary")}
                  {!planData && (
                    <Badge variant="secondary" className="text-xs">
                      {t("itinerary.example")}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {planData && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsExcel}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {t("itinerary.downloadExcel")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsPDF}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {t("itinerary.downloadPDF")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToGoogleCalendar}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      {t("itinerary.exportToGoogleCalendar")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPlan ? (
                <div className="space-y-8">
                  {[1, 2].map((day) => (
                    <div key={day}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 shimmer rounded-full"></div>
                        <div>
                          <div className="h-5 shimmer rounded w-16 mb-2"></div>
                          <div className="h-4 shimmer rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-3 ml-6 border-l-2 border-gray-200 pl-6">
                        {[1, 2, 3].map((activity) => (
                          <div key={activity} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-4 shimmer rounded w-12"></div>
                                  <div className="h-4 shimmer rounded w-8"></div>
                                </div>
                                <div className="h-5 shimmer rounded w-3/4 mb-2"></div>
                                <div className="h-4 shimmer rounded w-1/2"></div>
                              </div>
                              <div className="w-8 h-8 shimmer rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                              {/* Image moved next to lock button */}
                            </div>
                            {(() => {
                              const img = detectCityImageFromTexts(activity.name, activity.location);
                              if (!img) return null;
                              return (
                                <div className="shrink-0">
                                  <ImageWithFallback
                                    src={img}
                                    alt="City"
                                    className="w-28 h-16 object-cover rounded-md border"
                                  />
                                </div>
                              );
                            })()}
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}