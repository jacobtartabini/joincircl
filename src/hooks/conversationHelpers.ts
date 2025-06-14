
import { Conversation, ChatMessage } from "./conversationTypes";

// Parse messages array, converting timestamps to Date
export function parseMessages(messages: any[]): ChatMessage[] {
  return Array.isArray(messages)
    ? messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    : [];
}

// Parse a raw conversation from Supabase/db/localStorage to Conversation type
export function parseConversation(conv: any): Conversation {
  return {
    id: conv.id,
    title: conv.title,
    messages: parseMessages(conv.messages),
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
