
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem(`chat-history-${user.id}`);
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      } else {
        // Initialize with welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your relationship assistant. I can help you with managing your contacts, suggesting who to reach out to, and providing insights about your network. What would you like to know?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [user]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat-history-${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const clearHistory = () => {
    if (user) {
      localStorage.removeItem(`chat-history-${user.id}`);
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your relationship assistant. I can help you with managing your contacts, suggesting who to reach out to, and providing insights about your network. What would you like to know?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  return {
    messages,
    addMessage,
    clearHistory
  };
}
