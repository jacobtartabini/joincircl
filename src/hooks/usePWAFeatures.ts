
import { useCallback, useEffect, useState } from 'react';

export interface PWAFeaturesState {
  isInstallable: boolean;
  isInstalled: boolean;
  supportsSync: boolean;
  supportsPeriodicSync: boolean;
  supportsPush: boolean;
  supportsProtocolHandler: boolean;
  supportsShareTarget: boolean;
  supportsWidgets: boolean;
  isOffline: boolean;
  deferredPrompt: any | null;
}

export const usePWAFeatures = () => {
  const [features, setFeatures] = useState<PWAFeaturesState>({
    isInstallable: false,
    isInstalled: false,
    supportsSync: false,
    supportsPeriodicSync: false,
    supportsPush: false,
    supportsProtocolHandler: false,
    supportsShareTarget: false,
    supportsWidgets: false,
    isOffline: !navigator.onLine,
    deferredPrompt: null,
  });

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    // Check for available features
    const supportsSync = 'serviceWorker' in navigator && 'SyncManager' in window;
    const supportsPeriodicSync = 'serviceWorker' in navigator && 'PeriodicSyncManager' in window;
    const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;
    const supportsProtocolHandler = 'registerProtocolHandler' in navigator;
    const supportsShareTarget = 'share' in navigator;
    const supportsWidgets = 'widgets' in window;
    
    setFeatures(prev => ({
      ...prev,
      isInstalled: isStandalone,
      supportsSync,
      supportsPeriodicSync,
      supportsPush,
      supportsProtocolHandler,
      supportsShareTarget,
      supportsWidgets,
    }));

    // Save the beforeinstallprompt event to use later
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setFeatures(prev => ({ ...prev, isInstallable: true, deferredPrompt: e }));
    };

    // Handle online/offline events
    const handleOnlineStatusChange = () => {
      setFeatures(prev => ({ ...prev, isOffline: !navigator.onLine }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Detect when the app gets installed
    window.addEventListener('appinstalled', () => {
      setFeatures(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const { deferredPrompt } = features;
    
    if (!deferredPrompt) {
      return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Clear the deferred prompt
    setFeatures(prev => ({ ...prev, deferredPrompt: null }));
    
    return choiceResult.outcome === 'accepted';
  }, [features.deferredPrompt]);

  // Check if we need to show offline warning
  useEffect(() => {
    if (features.isOffline) {
      console.log('App is offline. Some features may be limited.');
      // You could show an offline banner or toast here
    }
  }, [features.isOffline]);

  return {
    ...features,
    promptInstall,
  };
};

export default usePWAFeatures;
