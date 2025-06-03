
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
      <div className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
        <div className="flex-1 overflow-hidden">
          {middlePanel}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full w-full overflow-hidden gap-6", className)}>
      {/* Left Navigation Panel */}
      <div className="w-80 flex-shrink-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          {leftPanel}
        </div>
      </div>
      
      {/* Middle Content Panel */}
      <div className={cn(
        "flex-1 overflow-hidden min-w-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200",
        rightPanel ? "max-w-[calc(100%-44rem)]" : "max-w-full"
      )}>
        <div className="h-full overflow-y-auto p-6">
          {middlePanel}
        </div>
      </div>
      
      {/* Right Detail Panel (optional) */}
      {rightPanel && (
        <div className="w-96 flex-shrink-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
}
