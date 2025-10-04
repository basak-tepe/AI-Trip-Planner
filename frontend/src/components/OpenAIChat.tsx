import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Send, Bot, User, ChevronLeft, ChevronRight } from "lucide-react";
import { ApiService } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useChat } from "../contexts/ChatContext";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function OpenAIChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const { currentChatId, setCurrentChatId } = useChat();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || !isConnected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      let response;
      
      // Create a new chat if we don't have one, otherwise use existing chat
      if (!currentChatId) {
        const newChat = await ApiService.createChat();
        setCurrentChatId(newChat.id);
        response = await ApiService.sendMessage(newChat.id, {
          role: 'user',
          content: prompt
        });
      } else {
        response = await ApiService.sendMessage(currentChatId, {
          role: 'user',
          content: prompt
        });
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing prompt:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process prompt'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentPage(0);
  };

  // Pagination helpers
  const messagesPerPage = 4;
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const startIndex = currentPage * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Auto-navigate to next page when new message exceeds current page
  React.useEffect(() => {
    if (messages.length > previousMessageCount && messages.length > 0) {
      const newTotalPages = Math.ceil(messages.length / messagesPerPage);
      const newStartIndex = currentPage * messagesPerPage;
      const newEndIndex = newStartIndex + messagesPerPage;
      
      // If the last message is beyond the current page, go to the last page
      if (messages.length > newEndIndex) {
        setCurrentPage(newTotalPages - 1);
      }
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, currentPage, messagesPerPage, previousMessageCount]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  {t('chat.title')} {t('chat.titleHighlight')}
                </CardTitle>
                <CardDescription>
                  {t('chat.description')}
                </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? t('chat.connected') : t('chat.offline')}
            </Badge>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Messages */}
        <ScrollArea className="h-96 mb-6">
          <div className="space-y-4 pr-4">
            {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('chat.startConversation')}</p>
                    <p className="text-sm">{t('chat.tryAsking')}</p>
                  </div>
            ) : (
              <>
                {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                ))}
                
                {/* Navigation Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500 px-2">
                      {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages - 1}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="min-h-[100px]"
                disabled={isLoading || !isConnected}
              />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? "Connected to AI backend" 
                : "Backend server is offline"
              }
            </p>
            <Button 
              type="submit" 
              disabled={!prompt.trim() || isLoading || !isConnected}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('chat.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('chat.sendMessage')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
