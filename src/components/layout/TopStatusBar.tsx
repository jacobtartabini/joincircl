
import React from "react";
import { Bell } from "lucide-react";
import { UserOnboarding } from "@/components/UserOnboarding";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatus } from "@/components/ui/offline-indicator";
import usePWAFeatures from "@/hooks/usePWAFeatures";

export function TopStatusBar() {
  const { isOffline } = usePWAFeatures();
  
  return (
    <div className="flex items-center justify-between py-2 md:py-3 px-4 border-b border-border">
      {/* Left section */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold hidden md:block">Circl</h1>
        <Badge variant="outline" className="hidden md:flex">
          Beta
        </Badge>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Connection status indicator */}
        <ConnectionStatus />
        
        {/* Bell icon */}
        <Bell className="h-5 w-5 text-muted-foreground" />
        
        {/* User onboarding */}
        <UserOnboarding />
      </div>
    </div>
  );
}
