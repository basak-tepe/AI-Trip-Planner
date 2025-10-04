import React, { useState, useEffect, useRef } from "react";
import { Bot, MessageSquare, Clock, Trash2, X, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { ApiService, Chat } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 4;
  const { t } = useLanguage();
  const chatRef = useRef<HTMLDivElement>(null);

  // Check connection and load chat history on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Checking backend connection...');
        await ApiService.healthCheck();
        console.log('Backend connected successfully');
        setIsConnected(true);
        await loadChatHistory();
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      }
    };
    
    initializeChat();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click detected, checking if outside...');
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        console.log('Click outside detected, closing chatbot');
        setIsOpen(false);
      }
    };

    if (isOpen) {
      console.log('Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      console.log('Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      console.log('Loading chat history...');
      const chats = await ApiService.getChats();
      console.log('Loaded chats:', chats);
      setChatHistory(chats);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      const chat = await ApiService.getChat(chatId);
      setSelectedChat(chat);
      setShowChatHistory(false);
      setCurrentPage(1); // Reset to first page when loading a new chat
      console.log('Loaded chat:', chat);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToHistory = () => {
    setSelectedChat(null);
    setShowChatHistory(true);
    setCurrentPage(1); // Reset pagination when going back
  };

  // Pagination helper functions
  const getPaginatedMessages = () => {
    if (!selectedChat?.messages) return [];
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    return selectedChat.messages.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (!selectedChat?.messages) return 0;
    return Math.ceil(selectedChat.messages.length / messagesPerPage);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatMessageContent = (content: any) => {
    if (typeof content === 'string') {
      return content;
    } else if (Array.isArray(content)) {
      // Format structured content as readable text
      return content.map((item, index) => {
        if (typeof item === 'object' && item.day) {
          return `Day ${item.day}: ${item.package_advice || 'Travel plan'}`;
        }
        return `Item ${index + 1}`;
      }).join('\n');
    }
    return 'Message content';
  };

  const deleteChat = async (chatId: string) => {
    try {
      await ApiService.deleteChat(chatId);
      await loadChatHistory();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getChatPreview = (chat: Chat) => {
    if (chat.messages.length === 0) return 'Empty chat';
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    // Handle different content types
    let content = '';
    if (typeof lastMessage.content === 'string') {
      content = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      // If content is an array (structured response), get the first item or create a summary
      content = 'Structured travel plan';
    } else {
      content = 'Message content';
    }
    
    return content.length > 50 
      ? content.substring(0, 50) + '...'
      : content;
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-300 z-50 cursor-pointer flex items-center justify-center"
        style={{ width: '56px', height: '56px', borderRadius: '50%' }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <Card ref={chatRef} className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 bg-white border-0">
      <CardHeader className="pb-0 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-4 h-4" />
        </Button>
        <div className="flex flex-col items-center gap-2">
          <div 
            className="bg-gradient-to-r from-primary to-secondary flex items-center justify-center"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <CardTitle className="text-lg">{t('chat.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('chat.description')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 px-4 py-2">
          {showChatHistory ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm">Loading chat history...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No previous chats found</p>
                    <p className="text-xs">Start a conversation to see it here</p>
                  </div>
                ) : (
                  <>
                    {chatHistory.slice(0, 4).map((chat) => {
                      try {
                        return (
                          <div
                            key={chat.id}
                            className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted"
                            onClick={() => loadChat(chat.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  Chat {chat.id.slice(0, 8)}...
                                </p>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {getChatPreview(chat)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(chat.updated_at)}</span>
                                  <span>•</span>
                                  <span>{chat.messages?.length || 0} messages</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                }}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering chat:', chat.id, error);
                        return (
                          <div key={chat.id} className="p-3 rounded-lg border bg-red-50">
                            <p className="text-sm text-red-600">Error loading chat</p>
                          </div>
                        );
                      }
                    })}
                    
                    {/* Show "..." if there are more than 4 chats */}
                    {chatHistory.length > 4 && (
                      <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 text-center">
                        <p className="text-sm text-muted-foreground">
                          ... and {chatHistory.length - 4} more chats
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          ) : selectedChat ? (
            <div className="h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackToHistory}
                  className="text-muted-foreground"
                >
                  ← Back to chats
                </Button>
                <p className="text-sm text-muted-foreground">
                  {selectedChat.messages?.length || 0} messages
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  ) : selectedChat.messages?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No messages in this chat</p>
                    </div>
                  ) : getPaginatedMessages().length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No messages on this page</p>
                    </div>
                  ) : (
                    <>
                      {getPaginatedMessages().map((message, index) => {
                        const globalIndex = (currentPage - 1) * messagesPerPage + index;
                        return (
                          <div
                            key={globalIndex}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">
                                {formatMessageContent(message.content)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Pagination Controls */}
                      {getTotalPages() > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {getTotalPages()}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === getTotalPages()}
                            className="flex items-center gap-1"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Premium Lock Section */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-amber-800">Premium Required</h4>
                            <p className="text-sm text-amber-700">Switch to premium plan to continue with chat history</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white"
                          size="sm"
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}