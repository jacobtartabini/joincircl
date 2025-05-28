
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isPressable?: boolean;
}

export function MobileCard({ children, className, onClick, isPressable }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        isPressable && "active:scale-[0.98] transition-transform duration-150",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("px-4 py-3 border-b border-gray-100", className)}>
      {children}
    </div>
  );
}

interface MobileCardContentProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}
