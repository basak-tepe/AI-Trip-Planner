import {
  Sparkles,
  Calendar,
  DollarSign,
  FileCheck,
  Brain,
  Zap,
  Users,
  Leaf,
  Package,
  Trophy,
  MessageCircle,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const features = [
  {
    icon: Calendar,
    title: "Smart Itinerary Builder",
    description: "AI generates perfect daily plans based on your duration, budget, and interests. Lock must-see spots and let AI fill the rest.",
    color: "from-primary to-secondary",
  },
  {
    icon: DollarSign,
    title: "Dynamic Budget Calculator",
    description: "Real-time cost estimates for flights, hotels, food, and attractions. Adjust sliders from backpacker to luxury.",
    color: "from-secondary to-accent",
  },
  {
    icon: FileCheck,
    title: "Visa & Entry Checker",
    description: "Instant access to current visa rules, entry restrictions, and vaccination requirements for any destination.",
    color: "from-accent to-primary",
  },
  {
    icon: Brain,
    title: "AI Personality Matching",
    description: "Take our quiz and get personalized recommendations. Whether you're a foodie, culture lover, or adventure seeker.",
    color: "from-primary to-secondary",
  },
  {
    icon: Zap,
    title: "Real-Time Adjustments",
    description: "Museum closed? Flight delayed? AI instantly re-routes your itinerary with better alternatives.",
    color: "from-secondary to-accent",
  },
  {
    icon: MessageCircle,
    title: "AI Concierge Chat",
    description: "Ask anything, anytime. \"Best dinner spot near my hotel?\" Get instant, context-aware recommendations.",
    color: "from-accent to-primary",
  },
  {
    icon: Users,
    title: "Group Collaboration",
    description: "Plan together! Friends can vote on activities, share ideas, and build the perfect group itinerary.",
    color: "from-primary to-secondary",
  },
  {
    icon: Globe,
    title: "Community Travel Boards",
    description: "Discover hidden gems from other travelers. Share your experiences and upvote the best guides.",
    color: "from-secondary to-accent",
  },
  {
    icon: Leaf,
    title: "Sustainability Score",
    description: "See the eco-impact of your trip. Choose trains over planes, green hotels, and sustainable activities.",
    color: "from-accent to-primary",
  },
  {
    icon: Package,
    title: "Smart Packing Assistant",
    description: "AI-generated packing lists based on weather, activities, duration, and airline regulations.",
    color: "from-primary to-secondary",
  },
  {
    icon: Trophy,
    title: "Gamified Challenges",
    description: "Earn points for trying local dishes, visiting hidden gems, and making eco-friendly choices.",
    color: "from-secondary to-accent",
  },
  {
    icon: Sparkles,
    title: "Mood-Based Suggestions",
    description: "\"I need to de-stress\" → Beach escape. \"I want adventure\" → Hiking and rafting. AI reads your vibe.",
    color: "from-accent to-primary",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
            Everything You Need for the
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Perfect Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered tools that transform travel planning from overwhelming to effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}