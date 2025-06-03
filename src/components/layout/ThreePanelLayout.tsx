
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ThreePanelLayoutProps {
  leftPanel: ReactNode;
  middlePanel: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function ThreePanelLayout({
  leftPanel,
  middlePanel,
  rightPanel,
  className,
}: ThreePanelLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full w-full", className)}>
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {middlePanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full w-full gap-6", className)}>
      {/* Left Navigation Panel */}
      <div className="w-80 flex-shrink-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200">
        <div className="h-full overflow-y-auto p-6">
          <div className="min-h-full">
            {leftPanel}
          </div>
        </div>
      </div>
      
      {/* Middle Content Panel */}
      <div className={cn(
        "flex-1 min-w-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200",
        rightPanel ? "max-w-[calc(100%-44rem)]" : "max-w-full"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="min-h-full">
            {middlePanel}
          </div>
        </div>
      </div>
      
      {/* Right Detail Panel (optional) */}
      {rightPanel && (
        <div className="w-96 flex-shrink-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200">
          <div className="h-full overflow-y-auto p-6">
            <div className="min-h-full">
              {rightPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
