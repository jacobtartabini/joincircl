
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from './conversationTypes';
import { parseConversation, parseLocalConversation } from './conversationHelpers';
import { logDebug, logError } from './useConversations.utils';

export async function loadConversationsFromSupabase(userId: string) {
  logDebug('Starting to load conversations from Supabase', { userId });
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    logError('Supabase error loading conversations', error);
    throw error;
  }

  logDebug('Successfully loaded conversations from Supabase', { count: data?.length || 0, data });
  return (data || []).map(parseConversation);
}

export function loadConversationsFromLocalStorage(userId: string): Conversation[] {
  logDebug('Loading conversations from localStorage', { userId });
  const stored = localStorage.getItem(`arlo-conversations-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const conversationsWithDates = parsed.map(parseLocalConversation);
      logDebug('Successfully loaded conversations from localStorage', { count: conversationsWithDates.length });
      return conversationsWithDates;
    } catch (error) {
      logError('Error parsing conversations from localStorage', error);
    }
  } else {
    logDebug('No conversations found in localStorage');
  }
  return [];
}

export async function saveConversationToSupabase(
  userId: string,
  conversation: Conversation,
  conversationList: Conversation[]
) {
  try {
    logDebug('Saving conversation to Supabase', {
      conversationId: conversation.id,
      userId,
      messageCount: conversation.messages.length,
      title: conversation.title
    });
    const messagesWithStringTimestamps = conversation.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    const conversationData = {
      id: conversation.id,
      user_id: userId,
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
    saveConversationsToLocalStorage(userId, conversationList);
  }
}

export function saveConversationsToLocalStorage(
  userId: string,
  conversationList: Conversation[]
) {
  if (conversationList.length > 0) {
    try {
      logDebug('Saving conversations to localStorage', {
        userId,
        count: conversationList.length
      });
      localStorage.setItem(`arlo-conversations-${userId}`, JSON.stringify(conversationList));
      logDebug('Successfully saved to localStorage');
    } catch (error) {
      logError('Failed to save to localStorage', error);
    }
  }
}
