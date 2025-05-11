
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showCount?: boolean;
}

const NotificationBell = ({ 
  variant = "default", 
  size = "default",
  showCount = true
}: NotificationBellProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  const handleClick = () => {
    navigate('/notifications');
  };
  
  return (
    <Button onClick={handleClick} variant={variant} size={size} className="relative">
      <Bell className="h-5 w-5" />
      {showCount && unreadCount > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 bg-red-500 text-white rounded-full",
          size === "sm" ? "w-3.5 h-3.5 text-[0.6rem]" : "w-4 h-4 text-xs"
        )}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationBell;
