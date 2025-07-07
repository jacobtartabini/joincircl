
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "./sheet";
import { Dialog, DialogContent } from "./dialog";

interface DrawerMobileProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function DrawerMobile({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
}: DrawerMobileProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 glass-card border-0">
          <div className="mx-auto -mt-1 mb-6 h-1.5 w-[60px] rounded-full bg-muted/60 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing" />
          {(title || description) && (
            <div className="mb-6 px-1">
              {title && <h3 className="text-xl font-semibold text-foreground">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
            </div>
          )}
          <div className="mobile-scroll">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
