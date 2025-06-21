
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
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl flex flex-col items-start gap-4 h-full">
      <div className="flex items-start justify-between w-full">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 mb-2">
          {icon}
        </div>
        {onBookmarkChange && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Toggle
                    className="group size-9 p-0 hover:bg-indigo-50 hover:text-indigo-500 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-500"
                    aria-label="Bookmark this tool"
                    pressed={isBookmarked}
                    onPressedChange={onBookmarkChange}
                  >
                    <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
                  </Toggle>
                </div>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-xs">
                <p>{isBookmarked ? "Remove bookmark" : "Bookmark this tool"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" className="mt-2 rounded-full border-gray-200" onClick={onClick}>
        Open
      </Button>
    </Card>
  );
}
