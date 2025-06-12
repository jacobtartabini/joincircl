
import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "./MobileHeader";
import NotificationBell from "@/components/notifications/NotificationBell";

export function TopStatusBar() {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-between py-2 md:py-3 px-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 border border-gray-200">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
            ) : (
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-lg font-semibold text-foreground">Circl</h1>
        </div>
        <NotificationBell variant="ghost" size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 md:py-3 px-4 border-b border-border">
      {/* Left section - Profile and Circl wordmark */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 border border-gray-200">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
          ) : (
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <h1 className="text-xl font-semibold text-foreground">Circl</h1>
        <Badge variant="outline" className="hidden md:flex">
          Beta
        </Badge>
      </div>

      {/* Right section - Notifications */}
      <div className="flex items-center space-x-4">
        <NotificationBell variant="ghost" size="default" />
      </div>
    </div>
  );
}

export default TopStatusBar;
