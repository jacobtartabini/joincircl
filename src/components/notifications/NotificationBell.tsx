
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm';
  showCount?: boolean;
}

const NotificationBell = ({ 
  variant = 'ghost', 
  size = 'default',
  showCount = true 
}: NotificationBellProps) => {
  const { unreadCount } = useNotifications();
  
  return (
    <Button variant={variant} size={size} asChild>
      <Link to="/notifications" className="relative">
        <Bell className="h-5 w-5" />
        
        {showCount && unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center",
            "bg-primary rounded-full text-white text-xs font-bold",
            size === 'default' ? "w-4 h-4 min-w-4" : "w-3.5 h-3.5 min-w-3.5",
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
};

export default NotificationBell;
