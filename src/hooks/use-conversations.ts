import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
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

      setConversations(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? data : conv)
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
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
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const addMessage = async (conversationId: string, message: Message) => {
    if (!user) return;

    try {
      // First get the current conversation
      const { data: currentConv, error: fetchError } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentMessages = (currentConv.messages as Message[]) || [];
      const updatedMessages = [...currentMessages, message];

      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? data : conv)
      );
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    isLoading,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    refetch: fetchConversations
  };
}
