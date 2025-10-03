import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

type Message = {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    role: "ai",
    content: "Hi! I'm your AI travel concierge. Ask me anything about your trip - from restaurant recommendations to last-minute changes!",
    timestamp: new Date(),
  },
];

const quickSuggestions = [
  "Best dinner spots near my hotel?",
  "What to do if it rains tomorrow?",
  "Kid-friendly activities in the area",
  "Local transportation tips",
];

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "ai",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const getAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("dinner") || lowerQuery.includes("restaurant")) {
      return "Based on your location, I recommend 'The Blue Elephant' - it's a 5-minute walk from your hotel, serves authentic Thai cuisine, and has great reviews for their Pad Thai. They're open until 11 PM. Would you like me to help you book a table?";
    } else if (lowerQuery.includes("rain") || lowerQuery.includes("weather")) {
      return "If it rains tomorrow, here are some great indoor alternatives: 1) Jim Thompson House Museum (cultural experience), 2) MBK Shopping Center (shopping & food), 3) SEA LIFE Bangkok Ocean World (family-friendly). I can adjust your itinerary automatically if you'd like!";
    } else if (lowerQuery.includes("kid") || lowerQuery.includes("child")) {
      return "Great question! Here are kid-friendly activities nearby: 1) Safari World (animals & shows), 2) KidZania Bangkok (interactive learning), 3) Dream World (theme park). All are within 30 minutes. Would you like detailed timings and costs?";
    } else if (lowerQuery.includes("transport")) {
      return "For local transportation: Use the BTS Skytrain (fast & clean) or MRT subway. Get a Rabbit Card for easy payment. Grab is reliable for taxis. Avoid tuk-tuks in tourist areas (overpriced). Let me know if you need directions to specific places!";
    }
    return "I'd be happy to help with that! Based on your itinerary and location, I can provide personalized recommendations. Could you give me a bit more detail about what you're looking for?";
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <Bot className="w-8 h-8 text-white" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-white">AI Travel Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-secondary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-primary to-secondary"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}