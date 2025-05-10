
import { useState, useEffect } from 'react';
import { Notification } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';
import { mockNotifications } from '@/mock/notifications';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load notifications from local storage on mount
  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(`notifications-${user.id}`);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // First time setup: use mock data
        setNotifications(mockNotifications);
        localStorage.setItem(`notifications-${user.id}`, JSON.stringify(mockNotifications));
      }
    }
  }, [user]);
  
  // Save notifications to local storage whenever they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Try to show a push notification if supported and permitted
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png'
      });
    }
    
    return newNotification.id;
  };

  // Toggle the read status of a notification
  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, read: !item.read } 
          : item
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(item => ({ ...item, read: true }))
    );
  };

  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`notifications-${user.id}`);
    }
  };

  // Check if there are any unread notifications
  const hasUnread = notifications.some(notification => !notification.read);
  
  // Count of unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Request push notification permissions
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Push notifications not supported",
        description: "Your browser doesn't support push notifications",
        variant: "destructive",
      });
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  };

  return {
    notifications,
    addNotification,
    toggleNotificationRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    hasUnread,
    unreadCount,
    requestPushPermission
  };
}
