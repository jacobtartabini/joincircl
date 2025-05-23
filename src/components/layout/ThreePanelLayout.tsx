
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("grid grid-cols-12 gap-4 h-full overflow-hidden", className)}>
      {/* Left Navigation Panel */}
      <div className="col-span-2 border-r bg-white rounded-lg shadow-sm overflow-y-auto">
        {leftPanel}
      </div>
      
      {/* Middle Content Panel */}
      <div className={cn("overflow-y-auto", rightPanel ? "col-span-6" : "col-span-10")}>
        {middlePanel}
      </div>
      
      {/* Right Detail Panel (optional) */}
      {rightPanel && (
        <div className="col-span-4 border-l bg-white rounded-lg shadow-sm overflow-y-auto">
          {rightPanel}
        </div>
      )}
    </div>
  );
}
