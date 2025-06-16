
import { useState, useEffect } from 'react';
import type { Notification } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUnifiedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

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
                  read: false
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
  }, [user]);

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
