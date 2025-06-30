
export const validateSession = async (): Promise<boolean> => {
  try {
    // Simple session validation - just check if we have a valid timestamp
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      return false;
    }
    
    const timeDiff = Date.now() - parseInt(lastActivity);
    const maxInactive = 24 * 60 * 60 * 1000; // 24 hours
    
    if (timeDiff > maxInactive) {
      localStorage.removeItem('lastActivity');
      return false;
    }
    
    // Update last activity
    localStorage.setItem('lastActivity', Date.now().toString());
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};
