
import React from "react";
import UserOnboarding from "@/components/UserOnboarding";
import { Badge } from "@/components/ui/badge";

export function TopStatusBar() {
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
        {/* User onboarding */}
        <UserOnboarding />
      </div>
    </div>
  );
}

export default TopStatusBar;
