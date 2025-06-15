
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModernNotificationItem from './ModernNotificationItem';
import type { Notification } from '@/types/notifications';

interface NotificationCategoriesProps {
  notifications: Notification[];
  onToggleRead: (id: string) => void;
  onClear: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

const categoryLabels = {
  follow_up: 'Follow-up Reminders',
  keystone_reminder: 'Upcoming Events',
  birthday_reminder: 'Birthdays',
  ai_insight: 'AI Insights',
  contact_update: 'Contact Updates',
  system: 'System Updates',
};

export default function NotificationCategories({
  notifications,
  onToggleRead,
  onClear,
  onNotificationClick
}: NotificationCategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['follow_up', 'keystone_reminder', 'ai_insight']));

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const type = notification.type || 'system';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (Object.keys(groupedNotifications).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0daeec]/10 to-[#0daeec]/5 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-[#0daeec]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
        <p className="text-muted-foreground">
          You have no new notifications. We'll notify you when something important happens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => {
        const isExpanded = expandedCategories.has(category);
        const unreadCount = categoryNotifications.filter(n => !n.read).length;
        const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 'Other';

        return (
          <div key={category} className="glass-card-enhanced overflow-hidden">
            <Button
              variant="ghost"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 h-auto hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{categoryLabel}</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-[#0daeec] text-white">
                    {unreadCount}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {categoryNotifications.length} {categoryNotifications.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/20 bg-white/20">
                    <div className="space-y-2 p-2">
                      {categoryNotifications.map((notification) => (
                        <ModernNotificationItem
                          key={notification.id}
                          notification={notification}
                          onToggleRead={onToggleRead}
                          onClear={onClear}
                          onClick={onNotificationClick}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
