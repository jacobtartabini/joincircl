
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from './conversationTypes';
import { logDebug, logError } from './useConversations.utils';

export const loadConversationsFromSupabase = async (userId: string): Promise<Conversation[]> => {
  try {
    logDebug('Loading conversations from Supabase', { userId });
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      logError('Supabase query error', error);
      throw error;
    }

    const conversations = data?.map(row => ({
      id: row.id,
      title: row.title,
      messages: JSON.parse(row.messages),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) || [];

    logDebug('Successfully loaded conversations from Supabase', { count: conversations.length });
    return conversations;
  } catch (error) {
    logError('Failed to load conversations from Supabase', error);
    throw error;
  }
};

export const saveConversationToSupabase = async (userId: string, conversation: Conversation): Promise<void> => {
  try {
    logDebug('Saving conversation to Supabase', { conversationId: conversation.id, userId });

    const { error } = await supabase
      .from('conversations')
      .upsert({
        id: conversation.id,
        user_id: userId,
        title: conversation.title,
        messages: JSON.stringify(conversation.messages),
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString()
      });

    if (error) {
      logError('Supabase upsert error', error);
      throw error;
    }

    logDebug('Successfully saved conversation to Supabase');
  } catch (error) {
    logError('Failed to save conversation to Supabase', error);
    // Don't throw here to allow fallback to localStorage
    saveConversationsToLocalStorage(userId, [conversation]);
  }
};

export const loadConversationsFromLocalStorage = (userId: string): Conversation[] => {
  try {
    const stored = localStorage.getItem(`conversations_${userId}`);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    logError('Failed to load conversations from localStorage', error);
    return [];
  }
};

export const saveConversationsToLocalStorage = (userId: string, conversations: Conversation[]): void => {
  try {
    localStorage.setItem(`conversations_${userId}`, JSON.stringify(conversations));
    logDebug('Saved conversations to localStorage', { count: conversations.length });
  } catch (error) {
    logError('Failed to save conversations to localStorage', error);
  }
};
