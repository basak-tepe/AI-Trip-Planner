import { useState } from "react";
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
  const [accommodations, setAccommodations] = useState(mockAccommodations);
  const [modificationPrompt, setModificationPrompt] = useState("");

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

  const totalCost = itinerary.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0),
    0
  );

  return (
    <section id="itinerary" className="py-20 bg-gradient-to-b from-background to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
            Build Your Perfect
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Itinerary
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lock your must-see activities and let AI optimize the rest
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Trip Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Destination</Label>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <Input placeholder="Bangkok, Thailand" />
                </div>
              </div>

              <div>
                <Label>Trip Duration: {tripDays} days</Label>
                <Slider
                  value={[tripDays]}
                  onValueChange={(value) => setTripDays(value[0])}
                  max={30}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Budget: ${budget[0]}</Label>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  max={10000}
                  min={500}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Backpacker</span>
                  <span>Luxury</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Current Cost:</span>
                  <span className="text-sm">${totalCost}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Budget:</span>
                  <span className="text-sm">${budget[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Remaining:</span>
                  <span className={`text-sm ${budget[0] - totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${budget[0] - totalCost}
                  </span>
                </div>
              </div>

              <Button className="w-full bg-primary">
                Regenerate with AI
              </Button>
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Itinerary</CardTitle>
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
                                  ${activity.cost}
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

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Options Section */}
        <div className="mt-12">
          <h3 className="text-center mb-8">
            Explore
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Alternative Options
            </span>
          </h3>

          <Tabs defaultValue="accommodation" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="accommodation">
                <Hotel className="w-4 h-4 mr-2" />
                Accommodation
              </TabsTrigger>
              <TabsTrigger value="activities">
                <MapPin className="w-4 h-4 mr-2" />
                Activities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accommodation">
              <div className="grid md:grid-cols-3 gap-6">
                {accommodations.map((acc, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      acc.selected
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => selectAccommodation(index)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <CardTitle className="text-lg">{acc.name}</CardTitle>
                          <CardDescription>{acc.type}</CardDescription>
                        </div>
                        {acc.selected && (
                          <Badge className="bg-gradient-to-r from-primary to-secondary">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">{acc.rating}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        {acc.location}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {acc.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-baseline gap-1 text-primary">
                        <span className="text-2xl">${acc.price}</span>
                        <span className="text-sm text-muted-foreground">/night</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        via Booking.com API
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  View More Options
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <div className="space-y-6">
                {itinerary.map((day) => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle>Day {day.day} - Alternative Activities</CardTitle>
                      <CardDescription>
                        Swap any activity with these alternatives
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        {mockAlternativeActivities[day.day as keyof typeof mockAlternativeActivities]?.map(
                          (activity, index) => (
                            <div
                              key={index}
                              className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-primary"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm">{activity.time}</span>
                                <Badge variant="outline" className="ml-auto">
                                  ${activity.cost}
                                </Badge>
                              </div>
                              <h4 className="text-sm mb-1">{activity.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full mt-3 text-primary"
                              >
                                Swap Activity
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modify Plan Section */}
        <Card className="mt-12 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Modify Your Plan</CardTitle>
                <CardDescription>
                  Tell AI how you'd like to change or enhance your itinerary
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={modificationPrompt}
              onChange={(e) => setModificationPrompt(e.target.value)}
              placeholder="e.g., 'Add more cultural activities', 'Make it more budget-friendly', 'Include a day trip to Ayutthaya', 'Swap the rooftop bar with a spa visit'..."
              className="min-h-[100px] mb-4"
            />
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Update Itinerary
              </Button>
              <Button variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}