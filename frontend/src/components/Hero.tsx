import { useState } from "react";
import { Sparkles, MapPin, Calendar, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  const [usePrompt, setUsePrompt] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1682444944126-9fb22591061e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGklMjBwaGklMjBpc2xhbmQlMjB0dXJxdW9pc2UlMjBvY2VhbnxlbnwxfHx8fDE3NTkyNDI2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Phi Phi Island"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-background"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">AI-Powered Travel Planning</span>
          </div>

          <h1 className="text-5xl md:text-7xl mb-6 text-white drop-shadow-lg">
            Your Dream Trip,
            <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Perfectly Planned
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-white/90 drop-shadow max-w-2xl mx-auto">
            Let AI craft your perfect itinerary. From flights to hidden gems, we handle everything so you can focus on the adventure.
          </p>

          {/* Quick Search */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto mb-8">
            {/* Toggle between form and prompt */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={!usePrompt ? "default" : "outline"}
                onClick={() => setUsePrompt(false)}
                className={!usePrompt ? "bg-gradient-to-r from-primary to-secondary flex-1" : "flex-1"}
              >
                Quick Search
              </Button>
              <Button
                variant={usePrompt ? "default" : "outline"}
                onClick={() => setUsePrompt(true)}
                className={usePrompt ? "bg-gradient-to-r from-primary to-secondary flex-1" : "flex-1"}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Prompt
              </Button>
            </div>

            {!usePrompt ? (
              <>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder="Where to?"
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder="When?"
                      type="date"
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder="Budget"
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <Textarea
                  placeholder="Tell us about your dream trip... e.g., 'I want a 5-day romantic getaway in Paris with good food and wine tasting, budget around $3000'"
                  className="min-h-[120px] bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2 text-left">
                  💡 Try: "Adventure trip in New Zealand", "Family vacation with kids", "Solo backpacking through Southeast Asia"
                </p>
              </div>
            )}

            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-14">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Itinerary
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="text-3xl text-white mb-1">500K+</div>
              <div className="text-sm text-white/80">Trips Planned</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="text-3xl text-white mb-1">195</div>
              <div className="text-sm text-white/80">Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="text-3xl text-white mb-1">98%</div>
              <div className="text-sm text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}