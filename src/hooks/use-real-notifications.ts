
import { useState, useEffect } from 'react';
import type { Notification } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useContacts } from '@/hooks/use-contacts';
import { useKeystones } from '@/hooks/use-keystones';

export function useRealNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { keystones } = useKeystones();

  // Generate real notifications based on app data
  useEffect(() => {
    if (!user || !contacts || !keystones) return;

    const realNotifications: Notification[] = [];

    // Generate follow-up reminders for contacts not contacted recently
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    contacts.forEach(contact => {
      if (contact.last_contact) {
        const lastContactDate = new Date(contact.last_contact);
        if (lastContactDate < thirtyDaysAgo) {
          realNotifications.push({
            id: `followup-${contact.id}`,
            title: 'Follow-up Reminder',
            message: `It's been a while since you contacted ${contact.name}. Consider reaching out!`,
            timestamp: new Date().toISOString(),
            type: 'follow_up',
            read: false
          });
        }
      }
    });

    // Generate upcoming keystone notifications
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    keystones.forEach(keystone => {
      const keystoneDate = new Date(keystone.date);
      if (keystoneDate <= nextWeek && keystoneDate >= new Date()) {
        realNotifications.push({
          id: `keystone-${keystone.id}`,
          title: 'Upcoming Event',
          message: `${keystone.title} is coming up on ${keystoneDate.toLocaleDateString()}`,
          timestamp: new Date().toISOString(),
          type: 'keystone_reminder',
          read: false
        });
      }
    });

    // Generate contact milestone notifications (birthdays)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    contacts.forEach(contact => {
      if (contact.birthday) {
        const birthday = new Date(contact.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday >= today && thisYearBirthday <= nextMonth) {
          realNotifications.push({
            id: `birthday-${contact.id}`,
            title: 'Upcoming Birthday',
            message: `${contact.name}'s birthday is on ${thisYearBirthday.toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            type: 'birthday_reminder',
            read: false
          });
        }
      }
    });

    // Add AI insight notifications
    if (contacts.length > 0) {
      realNotifications.push({
        id: 'ai-insight-1',
        title: 'Network Insight',
        message: `You have ${contacts.filter(c => c.circle === 'inner').length} contacts in your inner circle. Consider expanding your network!`,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        type: 'ai_insight',
        read: false
      });
    }

    // Sort by timestamp (newest first)
    realNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(realNotifications);
  }, [user, contacts, keystones]);

  // Toggle notification read status
  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, read: !notification.read }
        : notification
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  // Clear specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const hasUnread = notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    toggleNotificationRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    hasUnread,
    unreadCount
  };
}
