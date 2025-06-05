
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
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed z-40 rounded-full shadow-lg transition-all duration-300",
        "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
        "border-0 hover:scale-110 hover:shadow-xl",
        isMobile 
          ? "bottom-20 right-4 h-12 w-12" // Mobile: smaller, positioned above mobile nav
          : "bottom-6 right-6 h-14 w-14", // Desktop: original size and position
        isActive && "scale-110 shadow-xl"
      )}
    >
      <div className="relative">
        {isHovered && !isMobile ? (
          <MessageCircle className={cn(
            "text-white",
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
        ) : (
          <Brain className={cn(
            "text-white",
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
        )}
        
        {hasUnreadSuggestions && !isActive && (
          <div className={cn(
            "absolute bg-red-500 rounded-full border-2 border-white",
            isMobile 
              ? "-top-0.5 -right-0.5 w-2.5 h-2.5" 
              : "-top-1 -right-1 w-3 h-3"
          )} />
        )}
      </div>
    </Button>
  );
}
