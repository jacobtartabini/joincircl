
import { useCallback, useEffect, useState } from 'react';

export interface PWAFeaturesState {
  isInstallable: boolean;
  isInstalled: boolean;
  supportsSync: boolean;
  supportsPeriodicSync: boolean;
  supportsPush: boolean;
  supportsProtocolHandler: boolean;
  supportsShareTarget: boolean;
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
    
    setFeatures(prev => ({
      ...prev,
      isInstalled: isStandalone,
      supportsSync,
      supportsPeriodicSync,
      supportsPush,
      supportsProtocolHandler,
      supportsShareTarget,
    }));

    // Save the beforeinstallprompt event to use later
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setFeatures(prev => ({ ...prev, isInstallable: true, deferredPrompt: e }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Detect when the app gets installed
    window.addEventListener('appinstalled', () => {
      setFeatures(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  return {
    ...features,
    promptInstall,
  };
};

export default usePWAFeatures;
