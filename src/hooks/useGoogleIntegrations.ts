
import { useState, useEffect } from 'react';
import { googleService } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

export function useGoogleIntegrations() {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Check integration status on mount
  useEffect(() => {
    const checkIntegrations = async () => {
      setIsLoading(true);
      try {
        const [gmailStatus, calendarStatus] = await Promise.all([
          googleService.isConnected('gmail'),
          googleService.isConnected('calendar')
        ]);
        
        setIsGmailConnected(gmailStatus);
        setIsCalendarConnected(calendarStatus);
      } catch (error) {
        console.error('Error checking Google integrations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkIntegrations();
  }, []);

  // Connect to Gmail
  const connectGmail = async () => {
    try {
      await googleService.connectGmail();
      return true;
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Gmail",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Connect to Google Calendar
  const connectCalendar = async () => {
    try {
      await googleService.connectCalendar();
      return true;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Sync Gmail
  const syncGmail = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await googleService.fetchRecentEmails();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Gmail Synced",
        description: `Successfully processed ${data?.length || 0} emails`,
      });
      
      return data;
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync Gmail",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync Calendar
  const syncCalendar = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await googleService.fetchUpcomingEvents();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Calendar Synced",
        description: `Successfully synced ${data?.length || 0} upcoming events`,
      });
      
      return data;
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync Google Calendar",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Refresh status (useful after OAuth callback)
  const refreshIntegrationStatus = async () => {
    try {
      const [gmailStatus, calendarStatus] = await Promise.all([
        googleService.isConnected('gmail'),
        googleService.isConnected('calendar')
      ]);
      
      setIsGmailConnected(gmailStatus);
      setIsCalendarConnected(calendarStatus);
      
      return { isGmailConnected: gmailStatus, isCalendarConnected: calendarStatus };
    } catch (error) {
      console.error('Error refreshing Google integration status:', error);
      return { isGmailConnected, isCalendarConnected };
    }
  };
  
  // Disconnect Gmail
  const disconnectGmail = async () => {
    try {
      await googleService.disconnect('gmail');
      setIsGmailConnected(false);
      toast({
        title: "Disconnected",
        description: "Gmail disconnected successfully",
      });
      return true;
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast({
        title: "Failed",
        description: "Could not disconnect Gmail",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Disconnect Calendar
  const disconnectCalendar = async () => {
    try {
      await googleService.disconnect('calendar');
      setIsCalendarConnected(false);
      toast({
        title: "Disconnected",
        description: "Google Calendar disconnected successfully",
      });
      return true;
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: "Failed",
        description: "Could not disconnect Google Calendar",
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
    connectGmail,
    connectCalendar,
    syncGmail,
    syncCalendar,
    refreshIntegrationStatus,
    disconnectGmail,
    disconnectCalendar
  };
}
