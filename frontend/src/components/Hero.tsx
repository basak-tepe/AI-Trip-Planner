import React, { useState } from "react";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ApiService } from "../services/api";
import { MoodTravel } from "./MoodTravel";
import { useLanguage } from "../contexts/LanguageContext";

export function Hero() {
  const [usePrompt, setUsePrompt] = useState(false);
  const { t } = useLanguage();
  
  // Form state
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [prompt, setPrompt] = useState("");
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      let queryPrompt = "";
      
      if (usePrompt) {
        queryPrompt = prompt;
      } else {
        // Build prompt from form fields
        const parts: string[] = [];
        if (destination) parts.push(`destination: ${destination}`);
        if (date) parts.push(`dates: ${date}`);
        if (budget) parts.push(`budget: ${budget}`);
        
        queryPrompt = `Plan a trip with ${parts.join(", ")}`;
      }

      if (!queryPrompt.trim()) {
        setError("Please fill in at least one field or enter a prompt");
        return;
      }

      const response = await ApiService.generatePlan(queryPrompt);
      // Handle both string and structured responses
      if (typeof response.result === 'string') {
        setResult(response.result);
      } else if (Array.isArray(response.result)) {
        // Format structured response as readable text
        const formattedResult = response.result.map((day: any, index: number) => {
          const dayNumber = day.day || index + 1;
          const date = day.date || '';
          const packageAdvice = day.package_advice || '';
          const activities = day.day_activities || [];
          
          let dayText = `\n--- Day ${dayNumber}${date ? ` (${date})` : ''} ---\n`;
          if (packageAdvice) {
            dayText += `\n📦 Packing Advice: ${packageAdvice}\n`;
          }
          
          if (activities.length > 0) {
            dayText += '\nActivities:\n';
            activities.forEach((activity: any, actIndex: number) => {
              dayText += `${actIndex + 1}. ${activity.activity || 'Activity'}`;
              if (activity.time) dayText += ` (${activity.time})`;
              if (activity.location) dayText += ` at ${activity.location}`;
              if (activity.notes) dayText += `\n   💡 ${activity.notes}`;
              dayText += '\n';
            });
          }
          
          return dayText;
        }).join('\n');
        
        setResult(formattedResult);
      } else {
        setResult(JSON.stringify(response.result, null, 2));
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(err instanceof Error ? err.message : "Failed to generate plan");
      setResult(""); // Clear any previous result
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1682444944126-9fb22591061e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGklMjBwaGklMjBpc2xhbmQlMjB0dXJxdW9pc2UlMjBvY2VhbnxlbnwxfHx8fDE3NTkyNDI2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Phi Phi Island"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl mb-6 text-white drop-shadow-lg">
            {t('hero.title')}
            <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-white/90 drop-shadow max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          {/* AI Mood Travel, matches the width of the quick search*/}
          <div className="rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto mb-8">
            <MoodTravel 
              onMoodSelect={(mood, destination) => {
                setDestination(destination);
                setPrompt(`I'm feeling ${mood.toLowerCase()} and want to visit ${destination}. Plan a trip for me!`);
                setUsePrompt(true);
              }}
            />
          </div>

          {/* Quick Search */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto mb-8">
            {/* Toggle between form and prompt */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={!usePrompt ? "default" : "outline"}
                onClick={() => setUsePrompt(false)}
                className={!usePrompt ? "bg-gradient-to-r from-primary to-secondary flex-1" : "flex-1"}
              >
                {t('hero.quickSearch.title')}
              </Button>
              <Button
                variant={usePrompt ? "default" : "outline"}
                onClick={() => setUsePrompt(true)}
                className={usePrompt ? "bg-gradient-to-r from-primary to-secondary flex-1" : "flex-1"}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('hero.quickSearch.aiPrompt')}
              </Button>
            </div>

            {!usePrompt ? (
              <>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder={t('hero.quickSearch.whereTo')}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder={t('hero.quickSearch.when')}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                    <Input
                      placeholder={t('hero.quickSearch.budget')}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <Textarea
                  placeholder={t('hero.quickSearch.promptPlaceholder')}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2 text-left">
                  💡 {t('common.try')}: "{t('prompts.examples.adventure')}", "{t('prompts.examples.family')}", "{t('prompts.examples.solo')}"
                </p>
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full  bg-primary hover:opacity-90 h-14 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLoading ? t('common.loading') : t('hero.quickSearch.generatePlan')}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-3xl mx-auto mb-8">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto mb-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('hero.result.title')}</h3>
                  <p className="text-sm text-gray-500">{t('hero.result.subtitle')}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                    {result || "No content available"}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="flex-1"
                >
                  📋 {t('hero.result.copy')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setResult("")}
                  className="flex-1"
                >
                  ✨ {t('hero.result.newPlan')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}