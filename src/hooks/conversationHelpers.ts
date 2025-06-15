
import { Conversation, ChatMessage } from "./conversationTypes";

// Parse messages array, converting timestamps to Date
export function parseMessages(messages: any[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  
  return messages.map((msg: any) => ({
    id: msg.id || `msg-${Date.now()}-${Math.random()}`,
    role: msg.role || 'assistant',
    content: msg.content || '',
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
  }));
}

// Parse a raw conversation from Supabase/db/localStorage to Conversation type
export function parseConversation(conv: any): Conversation {
  return {
    id: conv.id,
    title: conv.title,
    messages: parseMessages(conv.messages || []),
    createdAt: new Date(conv.created_at ?? conv.createdAt),
    updatedAt: new Date(conv.updated_at ?? conv.updatedAt)
  };
}

// For localStorage: ensure all date fields and messages are properly converted
export function parseLocalConversation(conv: any): Conversation {
  return {
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: parseMessages(conv.messages)
  };
}
