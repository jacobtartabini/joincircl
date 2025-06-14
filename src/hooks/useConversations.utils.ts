
export const logDebug = (message: string, data?: any) => {
  console.log(`[useConversations] ${message}`, data || '');
};

export const logError = (message: string, error: any) => {
  console.error(`[useConversations] ${message}`, error);
};
