
import { useState, useEffect } from 'react';
import type { Notification } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUnifiedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  // Load read notification states from database
  const loadReadStates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_states')
        .select('notification_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading read states:', error);
        return;
      }

      const readIds = new Set(data?.map(item => item.notification_id) || []);
      setReadNotificationIds(readIds);
    } catch (error) {
      console.error('Error loading read states:', error);
    }
  };

  // Load real notifications from database and generate context-aware ones
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const realNotifications: Notification[] = [];

        // Get contacts for follow-up reminders
        const { data: contacts } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id);

        // Get keystones for upcoming events
        const { data: keystones } = await supabase
          .from('keystones')
          .select('*')
          .eq('user_id', user.id);

        // Get job applications for career updates
        const { data: jobApplications } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id);

        if (contacts && contacts.length > 0) {
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
                  read: false // Will be updated based on database state
                });
              }
            }
          });

          // Generate contact milestone notifications (birthdays)
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);

          contacts.forEach(contact => {
            if (contact.birthday) {
              const birthday = new Date(contact.birthday);
              const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
              
              if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
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

          // Add network insights
          const innerCircleCount = contacts.filter(c => c.circle === 'inner').length;
          if (innerCircleCount < 5) {
            realNotifications.push({
              id: 'network-insight-inner',
              title: 'Network Growth Opportunity',
              message: `You have ${innerCircleCount} contacts in your inner circle. Consider deepening more relationships!`,
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              type: 'network_insight',
              read: false
            });
          }
        }

        if (keystones && keystones.length > 0) {
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
        }

        if (jobApplications && jobApplications.length > 0) {
          // Generate job application follow-up reminders
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          jobApplications.forEach(app => {
            if (app.status === 'applied' && new Date(app.created_at) < sevenDaysAgo) {
              realNotifications.push({
                id: `job-followup-${app.id}`,
                title: 'Job Application Follow-up',
                message: `Consider following up on your application to ${app.company_name} for the ${app.job_title} position`,
                timestamp: new Date().toISOString(),
                type: 'job_followup',
                read: false
              });
            }
          });
        }

        // Sort by timestamp (newest first)
        realNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setNotifications(realNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    loadReadStates();
  }, [user]);

  // Update notifications with read states from database
  useEffect(() => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: readNotificationIds.has(notification.id)
    })));
  }, [readNotificationIds]);

  // Toggle notification read status and persist to database
  const toggleNotificationRead = async (id: string) => {
    if (!user) return;

    const isCurrentlyRead = readNotificationIds.has(id);

    try {
      if (isCurrentlyRead) {
        // Mark as unread - remove from database
        const { error } = await supabase
          .from('user_notification_states')
          .delete()
          .eq('user_id', user.id)
          .eq('notification_id', id);

        if (error) {
          console.error('Error marking notification as unread:', error);
          return;
        }

        setReadNotificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        // Mark as read - add to database
        const { error } = await supabase
          .from('user_notification_states')
          .upsert({
            user_id: user.id,
            notification_id: id
          });

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }

        setReadNotificationIds(prev => new Set([...prev, id]));
      }
    } catch (error) {
      console.error('Error toggling notification read status:', error);
    }
  };

  // Mark all as read and persist to database
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const unreadNotifications = notifications.filter(n => !readNotificationIds.has(n.id));
      
      if (unreadNotifications.length === 0) return;

      const readStates = unreadNotifications.map(notification => ({
        user_id: user.id,
        notification_id: notification.id
      }));

      const { error } = await supabase
        .from('user_notification_states')
        .upsert(readStates);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setReadNotificationIds(prev => {
        const newSet = new Set(prev);
        unreadNotifications.forEach(n => newSet.add(n.id));
        return newSet;
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear specific notification (remove from database if read)
  const clearNotification = async (id: string) => {
    if (!user) return;

    try {
      // Remove from read states if it exists
      if (readNotificationIds.has(id)) {
        await supabase
          .from('user_notification_states')
          .delete()
          .eq('user_id', user.id)
          .eq('notification_id', id);

        setReadNotificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }

      // Remove from notifications list
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  // Clear all notifications and their read states
  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      // Clear all read states for this user
      await supabase
        .from('user_notification_states')
        .delete()
        .eq('user_id', user.id);

      setNotifications([]);
      setReadNotificationIds(new Set());
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const hasUnread = notifications.some(n => !readNotificationIds.has(n.id));
  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

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
