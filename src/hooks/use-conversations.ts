
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

interface ConversationData {
  id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  // Load conversations from Supabase on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const parsedConversations = (data || []).map((conv: ConversationData) => ({
        id: conv.id,
        title: conv.title,
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at)
      }));

      setConversations(parsedConversations);

      // Set active conversation to the most recent one if none is set
      if (parsedConversations.length > 0 && !activeConversationId) {
        setActiveConversationId(parsedConversations[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to localStorage if Supabase fails
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    if (!user) return;

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

        if (conversationsWithDates.length > 0) {
          setActiveConversationId(conversationsWithDates[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations from localStorage:', error);
      }
    }
  };

  const saveToSupabase = async (conversation: Conversation) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          user_id: user.id,
          title: conversation.title,
          messages: conversation.messages,
          created_at: conversation.createdAt.toISOString(),
          updated_at: conversation.updatedAt.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversation to Supabase:', error);
      // Fallback to localStorage
      saveToLocalStorage();
    }
  };

  const saveToLocalStorage = () => {
    if (user && conversations.length > 0) {
      localStorage.setItem(`arlo-conversations-${user.id}`, JSON.stringify(conversations));
    }
  };

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
    saveToSupabase(newConversation);
    return newConversation.id;
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation from Supabase:', error);
    }

    setConversations(prev => prev.filter(conv => conv.id !== conversationId));

    // If we deleted the active conversation, switch to another one
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const renameConversation = (conversationId: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = { ...conv, title: newTitle, updatedAt: new Date() };
        saveToSupabase(updatedConv);
        return updatedConv;
      }
      return conv;
    }));
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

        saveToSupabase(updatedConv);
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
