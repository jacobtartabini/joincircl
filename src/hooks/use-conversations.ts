
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseConversation } from './conversationHelpers';
import { Conversation, ChatMessage } from './conversationTypes';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Get active conversation
  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const parsedConversations = (data || []).map(parseConversation);
      setConversations(parsedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (title: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: user.id,
          messages: []
        })
        .select()
        .single();

      if (error) throw error;

      const parsedConversation = parseConversation(data);
      setConversations(prev => [parsedConversation, ...prev]);
      return parsedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const createNewConversation = () => {
    const newId = `new-${Date.now()}`;
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [{
        id: 'initial',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
    if (!user) return;

    try {
      // Convert updates to database format
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.messages) {
        // Convert ChatMessage[] to Json format for database
        dbUpdates.messages = updates.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }));
      }

      const { data, error } = await supabase
        .from('conversations')
        .update(dbUpdates)
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const parsedConversation = parseConversation(data);
      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? parsedConversation : conv)
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    await updateConversation(conversationId, { title: newTitle });
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

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const addMessage = (conversationId: string, messageData: { role: 'user' | 'assistant'; content: string }) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: messageData.role,
      content: messageData.content,
      timestamp: new Date()
    };

    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date()
          };
          
          // Save to database if it's a real conversation (not a local one)
          if (!conversationId.startsWith('new-')) {
            updateConversation(conversationId, updatedConv);
          }
          
          return updatedConv;
        }
        return conv;
      })
    );

    return message.id;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    setActiveConversationId,
    createConversation,
    createNewConversation,
    updateConversation,
    renameConversation,
    deleteConversation,
    addMessage,
    refetch: fetchConversations,
    refreshConversations: fetchConversations
  };
}
