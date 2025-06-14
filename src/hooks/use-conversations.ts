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

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const logDebug = (message: string, data?: any) => {
    console.log(`[useConversations] ${message}`, data || '');
  };

  const logError = (message: string, error: any) => {
    console.error(`[useConversations] ${message}`, error);
  };

  useEffect(() => {
    if (user) {
      logDebug('User authenticated, loading conversations', { userId: user.id });
      loadConversations();
    } else {
      logDebug('No user authenticated, clearing conversations');
      setConversations([]);
      setActiveConversationId(null);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    logDebug('Setting up real-time subscription', { userId: user.id });

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
        (payload) => {
          logDebug('Real-time update received', payload);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      logDebug('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) {
      logDebug('Cannot load conversations: no user');
      setIsLoading(false);
      return;
    }

    try {
      logDebug('Starting to load conversations from Supabase', { userId: user.id });
      setIsLoading(true);

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        logError('Supabase error loading conversations', error);
        throw error;
      }

      logDebug('Successfully loaded conversations from Supabase', { count: data?.length || 0, data });

      const parsedConversations = (data || []).map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        messages: Array.isArray(conv.messages) ? conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) : [],
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at)
      }));

      setConversations(parsedConversations);

      if (parsedConversations.length > 0 && !activeConversationId) {
        logDebug('Setting active conversation to most recent', { conversationId: parsedConversations[0].id });
        setActiveConversationId(parsedConversations[0].id);
      }

      logDebug('Conversations loaded and parsed successfully', { count: parsedConversations.length });
    } catch (error) {
      logError('Failed to load conversations from Supabase, falling back to localStorage', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    if (!user) {
      logDebug('Cannot load from localStorage: no user');
      return;
    }

    logDebug('Loading conversations from localStorage', { userId: user.id });

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

        logDebug('Successfully loaded conversations from localStorage', { count: conversationsWithDates.length });
        setConversations(conversationsWithDates);

        if (conversationsWithDates.length > 0) {
          setActiveConversationId(conversationsWithDates[0].id);
        }
      } catch (error) {
        logError('Error parsing conversations from localStorage', error);
      }
    } else {
      logDebug('No conversations found in localStorage');
    }
  };

  const saveToSupabase = async (conversation: Conversation, conversationList: Conversation[] = conversations) => {
    if (!user) {
      logError('Cannot save to Supabase: no user authenticated', { conversationId: conversation.id });
      return;
    }
    try {
      logDebug('Saving conversation to Supabase', {
        conversationId: conversation.id,
        userId: user.id,
        messageCount: conversation.messages.length,
        title: conversation.title
      });
      const messagesWithStringTimestamps = conversation.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      const conversationData = {
        id: conversation.id,
        user_id: user.id,
        title: conversation.title,
        messages: messagesWithStringTimestamps,
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString()
      };
      logDebug('Conversation data prepared for Supabase', conversationData);
      const { error, data } = await supabase
        .from('conversations')
        .upsert(conversationData)
        .select();
      if (error) {
        logError('Supabase upsert error', error);
        throw error;
      }
      logDebug('Successfully saved conversation to Supabase', { data });
    } catch (error) {
      logError('Failed to save conversation to Supabase, falling back to localStorage', error);
      saveToLocalStorage(conversationList);
    }
  };

  const saveToLocalStorage = (conversationList: Conversation[] = conversations) => {
    if (user && conversationList.length > 0) {
      try {
        logDebug('Saving conversations to localStorage', {
          userId: user.id,
          count: conversationList.length
        });
        localStorage.setItem(`arlo-conversations-${user.id}`, JSON.stringify(conversationList));
        logDebug('Successfully saved to localStorage');
      } catch (error) {
        logError('Failed to save to localStorage', error);
      }
    }
  };

  const createNewConversation = () => {
    if (!user) {
      logError('Cannot create conversation: no user authenticated');
      return null;
    }
    const conversationId = crypto.randomUUID();
    logDebug('Creating new conversation', { conversationId, userId: user.id });
    const newConversation: Conversation = {
      id: conversationId,
      title: 'New Conversation',
      messages: [{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Hi! I'm Arlo, your relationship assistant. How can I help you today?",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    saveToSupabase(newConversation, updatedConversations);

    logDebug('New conversation created and saved', { conversationId });
    return newConversation.id;
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) {
      logError('Cannot delete conversation: no user authenticated');
      return;
    }

    logDebug('Deleting conversation', { conversationId, userId: user.id });

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        logError('Supabase delete error', error);
        throw error;
      }

      logDebug('Successfully deleted conversation from Supabase');
    } catch (error) {
      logError('Failed to delete conversation from Supabase', error);
    }

    setConversations(prev => prev.filter(conv => conv.id !== conversationId));

    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      const newActiveId = remaining.length > 0 ? remaining[0].id : null;
      logDebug('Switching active conversation', { newActiveId });
      setActiveConversationId(newActiveId);
    }
  };

  const renameConversation = (conversationId: string, newTitle: string) => {
    logDebug('Renaming conversation', { conversationId, newTitle });

    let conversationToUpdate: Conversation | null = null;
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = { ...conv, title: newTitle, updatedAt: new Date() };
        conversationToUpdate = updatedConv;
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConversations);

    if (conversationToUpdate) {
      saveToSupabase(conversationToUpdate, updatedConversations);
    }
  };

  const addMessage = (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user) {
      logError('Cannot add message: no user authenticated');
      return null;
    }

    const messageId = crypto.randomUUID();
    logDebug('Adding message to conversation', {
      conversationId,
      messageId,
      role: message.role,
      contentLength: message.content.length
    });

    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date()
    };

    let conversationToUpdate: Conversation | null = null;
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: new Date()
        };

        if (message.role === 'user' && conv.title === 'New Conversation') {
          const title = message.content.length > 50
            ? message.content.substring(0, 47) + '...'
            : message.content;
          updatedConv.title = title;
          logDebug('Auto-updating conversation title', { conversationId, newTitle: title });
        }
        conversationToUpdate = updatedConv;
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConversations);

    if (conversationToUpdate) {
      saveToSupabase(conversationToUpdate, updatedConversations);
    }

    return messageId;
  };

  const refreshConversations = () => {
    logDebug('Manual refresh triggered');
    loadConversations();
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    refreshConversations
  };
}
