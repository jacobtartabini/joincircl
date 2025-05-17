
import { useTwitterOAuth } from './social/useTwitterOAuth';
import { useSocialIntegrationStatus } from './social/useSocialIntegrationStatus';
import { useSocialPlatformOperations } from './social/useSocialPlatformOperations';
import { SocialPlatform, SocialIntegrationStatus, SocialSyncResult } from '@/types/socialIntegration';

export function useSocialIntegrations() {
  // Get integration status
  const { integrationStatus, isLoading, loadError, refreshStatus } = useSocialIntegrationStatus();
  
  // Get platform operations
  const { 
    isSyncing, 
    syncResults, 
    connectPlatform, 
    disconnectPlatform, 
    syncContacts 
  } = useSocialPlatformOperations(refreshStatus);
  
  // Setup Twitter OAuth handler
  useTwitterOAuth(refreshStatus);

  return {
    integrationStatus,
    isLoading,
    loadError,
    isSyncing,
    syncResults,
    connectPlatform,
    disconnectPlatform,
    syncContacts,
    refreshStatus
  };
}
