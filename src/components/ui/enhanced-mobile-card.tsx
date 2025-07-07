import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedMobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "minimal";
  interactive?: boolean;
}

export function EnhancedMobileCard({
  className,
  variant = "default",
  interactive = false,
  children,
  ...props
}: EnhancedMobileCardProps) {
  const variants = {
    default: "glass-card p-4 rounded-2xl",
    elevated: "glass-card-enhanced p-6 rounded-3xl shadow-lg",
    minimal: "bg-card/50 border border-border/20 p-4 rounded-xl backdrop-blur-sm"
  };

  return (
    <div
      className={cn(
        variants[variant],
        interactive && "glass-float cursor-pointer mobile-tap-target",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface MobileListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  title: string;
  subtitle?: string;
  interactive?: boolean;
}

function MobileListItem({
  leading,
  trailing,
  title,
  subtitle,
  interactive = false,
  className,
  ...props
}: MobileListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl transition-all duration-200",
        interactive && "glass-nav-item cursor-pointer mobile-tap-target hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      {leading}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}

export { EnhancedMobileCard as MobileCard, MobileListItem };