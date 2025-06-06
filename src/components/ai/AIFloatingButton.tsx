
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIFloatingButtonProps {
  onClick: () => void;
  isActive?: boolean;
  hasUnreadSuggestions?: boolean;
}

export default function AIFloatingButton({ 
  onClick, 
  isActive = false, 
  hasUnreadSuggestions = false 
}: AIFloatingButtonProps) {
  const isMobile = useIsMobile();
  
  // On mobile, we don't show the floating button as it's integrated into the nav
  if (isMobile) {
    return null;
  }

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed z-40 rounded-full shadow-lg transition-all duration-300",
        "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
        "border-0 hover:scale-110 hover:shadow-xl",
        "bottom-6 right-6 h-14 w-14", // Desktop only positioning
        isActive && "scale-110 shadow-xl"
      )}
    >
      <div className="relative">
        {isHovered ? (
          <MessageCircle className="h-6 w-6 text-white" />
        ) : (
          <Brain className="h-6 w-6 text-white" />
        )}
        
        {hasUnreadSuggestions && !isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>
    </Button>
  );
}
