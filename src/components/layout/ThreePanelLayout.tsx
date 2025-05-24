
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
        {/* On mobile, show only the middle panel by default */}
        <div className="flex-1 overflow-hidden">
          {middlePanel}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full w-full overflow-hidden", className)}>
      {/* Left Navigation Panel */}
      <div className="w-64 flex-shrink-0 border-r bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="panel-container">
          {leftPanel}
        </div>
      </div>
      
      {/* Middle Content Panel */}
      <div className={cn(
        "flex-1 overflow-hidden min-w-0",
        rightPanel ? "max-w-[calc(100%-32rem)]" : "max-w-full"
      )}>
        <div className="panel-container">
          {middlePanel}
        </div>
      </div>
      
      {/* Right Detail Panel (optional) */}
      {rightPanel && (
        <div className="w-80 flex-shrink-0 border-l bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="panel-container">
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
}
