
import { useState, useEffect } from 'react';
import { NotificationPreferences } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { requestSubscription } from '@/services/notificationService';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push: {
    newContacts: true,
    keystoneReminders: true,
    systemUpdates: false
  },
  email: {
    weeklySummary: true,
    importantKeystones: true,
    productUpdates: false
  }
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { user } = useAuth();
  
  // Load preferences from local storage on mount
  useEffect(() => {
    if (user) {
      const storedPreferences = localStorage.getItem(`notification-preferences-${user.id}`);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      } else {
        // First time setup: use defaults
        setPreferences(DEFAULT_PREFERENCES);
        localStorage.setItem(`notification-preferences-${user.id}`, JSON.stringify(DEFAULT_PREFERENCES));
      }
    }
  }, [user]);
  
  // Save preferences to local storage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification-preferences-${user.id}`, JSON.stringify(preferences));
    }
  }, [preferences, user]);
  
  // Get push subscription if supported
  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          setSubscription(existingSubscription);
        } catch (error) {
          console.error("Error checking push subscription:", error);
        }
      }
    };
    
    checkSubscription();
  }, []);

  // Toggle a push notification preference
  const togglePushNotification = async (key: keyof typeof preferences.push) => {
    const newValue = !preferences.push[key];
    
    setPreferences(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: newValue
      }
    }));
    
    // If enabling notifications and no subscription exists, request one
    if (newValue && !subscription && 'Notification' in window && Notification.permission !== 'denied') {
      try {
        const sub = await requestSubscription();
        if (sub) setSubscription(sub);
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
      }
    }
  };

  // Toggle an email notification preference
  const toggleEmailNotification = (key: keyof typeof preferences.email) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: !prev.email[key]
      }
    }));
  };

  // Send a test notification if we have a subscription
  const sendTestNotification = async () => {
    if (subscription) {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("Test Notification", {
            body: "This is a test notification from Circl",
            icon: '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png',
          });
          return true;
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification("Test Notification", {
              body: "This is a test notification from Circl",
              icon: '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png',
            });
            return true;
          }
        }
      } catch (error) {
        console.error("Error sending test notification:", error);
      }
    }
    return false;
  };

  return {
    preferences,
    togglePushNotification,
    toggleEmailNotification,
    sendTestNotification,
    hasSubscription: !!subscription
  };
}
