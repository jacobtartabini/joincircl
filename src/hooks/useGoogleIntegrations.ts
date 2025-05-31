
import { useState, useEffect } from 'react';
import { googleService } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

export function useGoogleIntegrations() {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check integration status on mount
  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [gmailConnected, calendarConnected] = await Promise.allSettled([
        googleService.isConnected('gmail'),
        googleService.isConnected('calendar')
      ]);
      
      setIsGmailConnected(
        gmailConnected.status === 'fulfilled' ? gmailConnected.value : false
      );
      setIsCalendarConnected(
        calendarConnected.status === 'fulfilled' ? calendarConnected.value : false
      );
      
    } catch (error: any) {
      console.warn('Error checking Google integrations:', error);
      setError('Failed to check integration status');
      
      // Set safe defaults
      setIsGmailConnected(false);
      setIsCalendarConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectGmail = async () => {
    try {
      setError(null);
      console.log("Initiating Gmail connection...");
      const result = await googleService.connectGmail();
      return result;
    } catch (error: any) {
      console.error('Error connecting to Gmail:', error);
      setError('Failed to connect to Gmail');
      toast({
        title: "Connection Failed",
        description: "Could not connect to Gmail. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const connectCalendar = async () => {
    try {
      setError(null);
      console.log("Initiating Google Calendar connection...");
      const result = await googleService.connectCalendar();
      return result;
    } catch (error: any) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Failed to connect to Google Calendar');
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const syncGmail = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      console.log("Syncing Gmail...");
      
      const { data, error } = await googleService.fetchRecentEmails();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Gmail Synced",
        description: `Successfully processed ${data?.length || 0} emails`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error syncing Gmail:', error);
      setError('Failed to sync Gmail');
      toast({
        title: "Sync Failed",
        description: "Could not sync Gmail. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };
  
  const syncCalendar = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      console.log("Syncing Google Calendar...");
      
      const { data, error } = await googleService.fetchUpcomingEvents();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Calendar Synced",
        description: `Successfully synced ${data?.length || 0} upcoming events`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error syncing Google Calendar:', error);
      setError('Failed to sync Google Calendar');
      toast({
        title: "Sync Failed",
        description: "Could not sync Google Calendar. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };
  
  const refreshIntegrationStatus = async () => {
    try {
      setError(null);
      console.log("Refreshing Google integration status...");
      await checkIntegrations();
    } catch (error: any) {
      console.warn('Error refreshing Google integration status:', error);
    }
  };
  
  const disconnectGmail = async () => {
    try {
      setError(null);
      console.log("Disconnecting Gmail...");
      await googleService.disconnect('gmail');
      setIsGmailConnected(false);
      toast({
        title: "Disconnected",
        description: "Gmail disconnected successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error disconnecting Gmail:', error);
      setError('Failed to disconnect Gmail');
      toast({
        title: "Failed",
        description: "Could not disconnect Gmail. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const disconnectCalendar = async () => {
    try {
      setError(null);
      console.log("Disconnecting Google Calendar...");
      await googleService.disconnect('calendar');
      setIsCalendarConnected(false);
      toast({
        title: "Disconnected",
        description: "Google Calendar disconnected successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect Google Calendar');
      toast({
        title: "Failed",
        description: "Could not disconnect Google Calendar. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isGmailConnected,
    isCalendarConnected,
    isLoading,
    isSyncing,
    error,
    connectGmail,
    connectCalendar,
    syncGmail,
    syncCalendar,
    refreshIntegrationStatus,
    disconnectGmail,
    disconnectCalendar
  };
}
