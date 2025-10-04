import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MapPin, Calendar, DollarSign, Loader2, Send, User, Bot } from "lucide-react";
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
  const quickSearchRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [prompt, setPrompt] = useState("");
  
  // Chat state
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const scrollToQuickSearch = () => {
    if (quickSearchRef.current) {
      quickSearchRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Function to format assistant message content
  const formatAssistantContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      return content.map((item: any) => {
        if (typeof item === 'object' && item.text) {
          return item.text;
        }
        return String(item);
      }).join('\n\n');
    }
    
    if (typeof content === 'object' && content !== null) {
      // Handle structured content
      if (content.text) {
        return content.text;
      }
      // Fallback to JSON string for other objects
      return JSON.stringify(content, null, 2);
    }
    
    return String(content);
  };

  // Auto-scroll to show latest message at bottom within chat container
  useEffect(() => {
    if (chatEndRef.current) {
      const chatContainer = chatEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || isChatLoading) return;

    // Check if this is the first message and we have a mood prompt to append
    const isFirstMessage = messages.length === 0;
    const shouldAppendMoodPrompt = isFirstMessage && prompt && prompt.trim();
    
    // Prepare the message content (secretly append mood prompt if needed)
    const messageContent = shouldAppendMoodPrompt 
      ? `${currentMessage}\n\n${prompt}` 
      : currentMessage;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: currentMessage, // Show only the user's original message in UI
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsChatLoading(true);

    try {
      let response;
      
      // Create a new chat if we don't have one, otherwise use existing chat
      if (!currentChatId) {
        const newChat = await ApiService.createChat();
        setCurrentChatId(newChat.id);
        response = await ApiService.sendMessage(newChat.id, {
          role: 'user',
          content: messageContent // Send the combined message to the API
        });
      } else {
        response = await ApiService.sendMessage(currentChatId, {
          role: 'user',
          content: messageContent // Send the combined message to the API
        });
      }
      
      // Format the assistant response content
      const assistantContent = formatAssistantContent(response.content);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear the mood prompt after it's been used once
      if (shouldAppendMoodPrompt) {
        setPrompt("");
      }
    } catch (err) {
      console.error('Error in chat:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Failed to generate response"}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

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
        const formattedResult = (response.result as any[]).map((day: any, index: number) => {
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
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1682444944126-9fb22591061e"
          alt="Phi Phi Island"
          className="w-full h-full object-cover"
        />
      </div>


      {/* Content */}
      <div className="container mx-auto px-4 z-10 flex items-center justify-center w-full py-8">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary backdrop-blur-sm px-4 py-2 rounded-full mb-6 mt-8">
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
                setUsePrompt(true);
                
                // Store the mood prompt for later use (secretly append to first user message)
                const moodPrompt = t(`prompts.moodPrompts.${mood}`);
                setPrompt(moodPrompt);
                
                // Scroll to quick search after a short delay to allow state updates
                setTimeout(() => {
                  scrollToQuickSearch();
                }, 100);
              }}
            />
          </div>

          {/* Quick Search */}
          <div ref={quickSearchRef} className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto mb-8">
            {/* Toggle between form and prompt */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={!usePrompt ? "default" : "outline"}
                onClick={() => {
                  setUsePrompt(false);
                  setMessages([]);
                  setCurrentMessage("");
                }}
                className={!usePrompt ? "bg-gradient-to-r from-primary to-secondary flex-1" : "flex-1"}
              >
                {t('hero.quickSearch.title')}
              </Button>
              <Button
                variant={usePrompt ? "default" : "outline"}
                onClick={() => {
                  setUsePrompt(true);
                  setResult("");
                  setError("");
                }}
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
                {/* Chat Interface */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 h-[400px] flex flex-col relative mx-auto max-w-3xl overflow-hidden">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ scrollBehavior: 'smooth' }}>
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">{t('chat.startConversationChat')}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          💡 {t('common.try')}: "{t('prompts.examples.adventure')}", "{t('prompts.examples.family')}", "{t('prompts.examples.solo')}"
                        </p>
                      </div>
                    ) : (
                      messages.slice(-3).map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div 
                            className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
                              message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <div className={`whitespace-pre-wrap text-sm leading-relaxed mt-2 ${
                              message.role === 'user' ? 'text-right' : 'text-left'
                            }`}>
                              {message.content}
                            </div>
                            <div className={`text-xs mb-2 ${
                              message.role === 'user' 
                                ? 'text-white/70 text-right' 
                                : 'text-gray-500 text-left'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-gray-600">{t('chat.thinking')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input - Sticky at bottom */}
                  <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
                    {messages.length > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          {messages.length} {t('chat.messageCount')}
                        </span>
                        <Button
                          onClick={() => {
                            setMessages([]);
                            setCurrentMessage("");
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          {t('chat.clearChat')}
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('chat.typeMessage')}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={isChatLoading}
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={!currentMessage.trim() || isChatLoading}
                        size="sm"
                        className="px-3"
                      >
                        {isChatLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!usePrompt ? (
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
            ) : (
              <div className="text-center text-sm text-gray-500">
                💬 {t('chat.chatWithAI')}
              </div>
            )}
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