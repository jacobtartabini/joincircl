
import { useTwitterOAuth } from './social/useTwitterOAuth';
import { useSocialIntegrationStatus } from './social/useSocialIntegrationStatus';
import { useSocialPlatformOperations } from './social/useSocialPlatformOperations';
import { SocialPlatform, SocialIntegrationStatus, SocialSyncResult } from '@/types/socialIntegration';
import { useCallback } from 'react';

export function useSocialIntegrations() {
  // Get integration status
  const { 
    integrationStatus, 
    isLoading, 
    loadError, 
    refreshStatus 
  } = useSocialIntegrationStatus();
  
  // Get platform operations
  const { 
    isSyncing, 
    syncResults, 
    connectingPlatform,
    connectPlatform, 
    disconnectPlatform, 
    syncContacts 
  } = useSocialPlatformOperations(refreshStatus);
  
  // Setup Twitter OAuth handler
  useTwitterOAuth(refreshStatus);

  // Enhanced refresh function with error handling
  const refreshStatusWithErrorHandling = useCallback(async () => {
    try {
      await refreshStatus();
    } catch (error) {
      console.error("Error refreshing integration status:", error);
    }
  }, [refreshStatus]);

  return {
    integrationStatus,
    isLoading,
    loadError,
    isSyncing,
    connectingPlatform,
    syncResults,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
    refreshStatus: refreshStatusWithErrorHandling
  };
}
