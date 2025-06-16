
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardModalHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

export function StandardModalHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  className 
}: StandardModalHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-6", className)}>
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
