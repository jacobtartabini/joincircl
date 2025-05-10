
import { Notification } from '@/types/notifications';

// Generate timestamps from now to the past
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const lastWeek = new Date(now);
lastWeek.setDate(lastWeek.getDate() - 7);

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Keystone Coming Up',
    message: 'Conference call with Sarah Johnson is scheduled for tomorrow at 2:00 PM',
    timestamp: yesterday.toISOString(),
    type: 'keystone',
    read: false
  },
  {
    id: '2',
    title: 'Contact Added',
    message: 'You added Michael Smith to your contacts',
    timestamp: twoDaysAgo.toISOString(),
    type: 'contact',
    read: true
  },
  {
    id: '3',
    title: 'Connection Reminder',
    message: 'It\'s been 30 days since you last connected with Alex Thompson',
    timestamp: yesterday.toISOString(),
    type: 'reminder',
    read: false
  },
  {
    id: '4',
    title: 'New App Feature',
    message: 'Check out our new integration with calendar apps!',
    timestamp: lastWeek.toISOString(),
    type: 'system',
    read: true
  },
  {
    id: '5',
    title: 'Birthday Reminder',
    message: 'James Wilson has a birthday coming up next week',
    timestamp: yesterday.toISOString(),
    type: 'keystone',
    read: false
  }
];
