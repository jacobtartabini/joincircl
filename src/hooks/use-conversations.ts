
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  // Load conversations from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`arlo-conversations-${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversationsWithDates);
          
          // Set active conversation to the most recent one
          if (conversationsWithDates.length > 0) {
            setActiveConversationId(conversationsWithDates[0].id);
          }
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    }
  }, [user]);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(`arlo-conversations-${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm Arlo, your relationship assistant. How can I help you today?",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If we deleted the active conversation, switch to another one
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const renameConversation = (conversationId: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title: newTitle, updatedAt: new Date() }
        : conv
    ));
  };

  const addMessage = (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: new Date()
        };
        
        // Auto-update title based on first user message
        if (message.role === 'user' && conv.title === 'New Conversation') {
          const title = message.content.length > 50 
            ? message.content.substring(0, 47) + '...'
            : message.content;
          updatedConv.title = title;
        }
        
        return updatedConv;
      }
      return conv;
    }));

    return newMessage.id;
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    addMessage
  };
}
