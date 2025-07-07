
import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "./MobileHeader";
import { AvatarNotificationBell } from "@/components/notifications/AvatarNotificationBell";
import { CirclLogo } from "@/components/ui/CirclLogo";

export function TopStatusBar() {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-border/20 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center space-x-3">
          <CirclLogo size={22} />
          <h1 className="text-lg font-semibold text-foreground gradient-text">Circl</h1>
        </div>
        <AvatarNotificationBell size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 md:py-3 px-4 border-b border-border">
      {/* Left section - Circl wordmark with logo */}
      <div className="flex items-center space-x-3">
        <CirclLogo size={24} />
        <h1 className="text-xl font-semibold text-foreground">Circl</h1>
        <Badge variant="outline" className="hidden md:flex">
          Beta
        </Badge>
      </div>

      {/* Right section - Avatar with Notifications */}
      <div className="flex items-center space-x-4">
        <AvatarNotificationBell showFullName />
      </div>
    </div>
  );
}

export default TopStatusBar;
