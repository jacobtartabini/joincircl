
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bookmark } from "lucide-react";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isBookmarked?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

export function ToolCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  isBookmarked = false,
  onBookmarkChange 
}: ToolCardProps) {
  return (
    <Card 
      className="p-6 flex flex-col items-start gap-4 h-full glass-float transition-all duration-700 hover:scale-[1.02]"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
      }}
    >
      <div className="flex items-start justify-between w-full">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          {icon}
        </div>
        {onBookmarkChange && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Toggle
                    className="group size-9 p-0 hover:bg-indigo-50/30 hover:text-indigo-500 data-[state=on]:bg-indigo-50/30 data-[state=on]:text-indigo-500 rounded-2xl"
                    aria-label="Bookmark this tool"
                    pressed={isBookmarked}
                    onPressedChange={onBookmarkChange}
                    style={{
                      backdropFilter: 'blur(10px)',
                      transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
                    }}
                  >
                    <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                className="px-2 py-1 text-xs"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p>{isBookmarked ? "Remove bookmark" : "Bookmark this tool"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground/80">{description}</p>
      </div>
      <Button 
        variant="outline" 
        className="mt-2 w-full transition-all duration-500" 
        onClick={onClick}
        style={{
          borderRadius: '16px',
          backdropFilter: 'blur(15px)',
          transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        }}
      >
        Open
      </Button>
    </Card>
  );
}
