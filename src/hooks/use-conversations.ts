
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, ChatMessage } from './conversationTypes';
import {
  logDebug,
  logError
} from './useConversations.utils';
import {
  loadConversationsFromSupabase,
  loadConversationsFromLocalStorage,
  saveConversationToSupabase,
  saveConversationsToLocalStorage
} from './useConversations.storage';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load conversations when user changes
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

  // Realtime updates from Supabase
  useEffect(() => {
    if (!user) return;
    logDebug('Setting up real-time subscription', { userId: user.id });

    const { supabase } = require('@/integrations/supabase/client');
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
        (payload: any) => {
          logDebug('Real-time update received', payload);
          loadConversations();
        }
      ).subscribe();

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
    setIsLoading(true);
    try {
      const loaded = await loadConversationsFromSupabase(user.id);
      setConversations(loaded);

      if (loaded.length > 0 && !activeConversationId) {
        logDebug('Setting active conversation to most recent', { conversationId: loaded[0].id });
        setActiveConversationId(loaded[0].id);
      }

      logDebug('Conversations loaded and parsed successfully', { count: loaded.length });
    } catch (error) {
      logError('Failed to load conversations from Supabase, falling back to localStorage', error);
      const local = loadConversationsFromLocalStorage(user.id);
      setConversations(local);

      if (local.length > 0) {
        setActiveConversationId(local[0].id);
      }
    } finally {
      setIsLoading(false);
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
    saveConversationToSupabase(user.id, newConversation, updatedConversations);

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
      const { supabase } = require('@/integrations/supabase/client');
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

    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);

    if (activeConversationId === conversationId) {
      const newActiveId = updatedConversations.length > 0 ? updatedConversations[0].id : null;
      logDebug('Switching active conversation', { newActiveId });
      setActiveConversationId(newActiveId);
    }
    const fallbackConversation: Conversation = updatedConversations[0] ?? {
      id: '',
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveConversationToSupabase(user.id, fallbackConversation, updatedConversations);
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
      saveConversationToSupabase(user!.id, conversationToUpdate, updatedConversations);
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
      saveConversationToSupabase(user.id, conversationToUpdate, updatedConversations);
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
