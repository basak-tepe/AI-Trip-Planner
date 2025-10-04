import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  onMessageSent?: () => void;
  setOnMessageSent: (callback: (() => void) | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [onMessageSent, setOnMessageSent] = useState<(() => void) | undefined>(undefined);

  return (
    <ChatContext.Provider value={{ currentChatId, setCurrentChatId, onMessageSent, setOnMessageSent }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
