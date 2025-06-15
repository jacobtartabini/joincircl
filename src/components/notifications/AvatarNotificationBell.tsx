
"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useRealNotifications } from "@/hooks/use-real-notifications";
import { useNavigate } from "react-router-dom";
import { User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarNotificationBellProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  showFullName?: boolean;
}

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6" 
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function AvatarNotificationBell({
  className,
  size = "default",
  showFullName = false,
}: AvatarNotificationBellProps) {
  const { user, profile } = useAuth();
  const { notifications, unreadCount, markAllAsRead, toggleNotificationRead } = useRealNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const badgeSize = {
    sm: "min-w-4 h-4 text-[10px]",
    default: "min-w-5 h-5 text-xs",
    lg: "min-w-6 h-6 text-sm"
  };

  const handleNotificationClick = (notificationId: string) => {
    toggleNotificationRead(notificationId);
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const displayName = profile?.full_name?.split(' ')[0] || 'User';
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()  
    : 'U';

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={cn("flex items-center gap-2", className)}>      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "relative p-0 rounded-full hover:bg-accent/50 transition-colors",
              sizeClasses[size]
            )}
            aria-label={`Open notifications (${unreadCount} unread)`}
          >
            <Avatar className={sizeClasses[size]}>
              {profile?.avatar_url ? (
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={profile?.full_name || 'User'} 
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <Badge 
                    className={cn(
                      "absolute -top-1 -right-1 border-2 border-background bg-[#0daeec] hover:bg-[#0daeec]/90 text-white px-1",
                      badgeSize[size]
                    )}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl" 
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#0daeec] hover:text-[#0daeec]/80 hover:bg-[#0daeec]/5 h-auto px-2 py-1"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllNotifications}
                className="text-xs text-muted-foreground hover:text-foreground h-auto px-2 py-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View all
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="py-2">
                {recentNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "relative px-4 py-3 hover:bg-gray-50/80 transition-colors cursor-pointer border-l-2",
                      notification.read 
                        ? "border-l-transparent" 
                        : "border-l-[#0daeec] bg-[#0daeec]/5"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3 pr-6">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0daeec]/20 to-[#0daeec]/10 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#0daeec]/60 rounded-full" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium text-foreground leading-tight">
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleDateString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Dot className="text-[#0daeec]" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllNotifications}
                className="w-full text-xs text-[#0daeec] hover:text-[#0daeec]/80 hover:bg-[#0daeec]/5"
              >
                View all notifications
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
