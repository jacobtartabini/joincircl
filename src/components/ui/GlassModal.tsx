
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardModalHeader } from "./StandardModalHeader";
import { LucideIcon } from "lucide-react";
import styles from "./glass.module.css";

export interface GlassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function GlassModal({ 
  open, 
  onOpenChange, 
  title, 
  subtitle,
  icon,
  children, 
  maxWidth = "max-w-2xl",
  className = ""
}: GlassModalProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="space-y-4">
      {icon && (
        <StandardModalHeader 
          icon={icon} 
          title={title} 
          subtitle={subtitle} 
        />
      )}
      {!icon && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={`${styles.glass} h-[95vh] overflow-auto border-0 shadow-xl rounded-t-3xl p-0 glass-card`}
        >
          <div className="mx-auto -mt-1 mb-6 h-1.5 w-[60px] rounded-full bg-muted/60 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing" />
          <div className="px-6 py-2 h-full overflow-y-auto mobile-scroll">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${styles.glass} ${maxWidth} ${className} border-0 shadow-xl rounded-3xl p-0 max-h-[90vh] overflow-hidden`}>
        <div className="px-8 py-6 h-full overflow-y-auto">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
