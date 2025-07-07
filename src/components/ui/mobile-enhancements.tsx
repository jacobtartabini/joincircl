import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileActionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

function MobileActionSheet({
  isOpen,
  onOpenChange,
  title,
  children,
}: MobileActionSheetProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="glass-card border-0 h-auto max-h-[80vh] overflow-auto">
        <div className="mx-auto -mt-1 mb-6 h-1.5 w-[60px] rounded-full bg-muted/60 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing" />
        {title && (
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold text-foreground text-left">{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="space-y-2">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileActionItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

function MobileActionItem({
  icon,
  label,
  description,
  onClick,
  variant = "default",
}: MobileActionItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 mobile-tap-target glass-nav-item",
        variant === "destructive" && "text-destructive"
      )}
    >
      {icon && (
        <div className={cn(
          "flex-shrink-0",
          variant === "destructive" ? "text-destructive" : "text-muted-foreground"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 text-left">
        <div className={cn(
          "font-medium",
          variant === "destructive" ? "text-destructive" : "text-foreground"
        )}>
          {label}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

interface MobileSwipeAreaProps {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

function MobileSwipeArea({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,
  className,
  threshold = 50,
}: MobileSwipeAreaProps) {
  const [startTouch, setStartTouch] = React.useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartTouch({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startTouch) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < threshold) return;

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    setStartTouch(null);
  };

  return (
    <div
      className={cn("touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

function MobilePullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: MobilePullToRefreshProps) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isAtTop = container.scrollTop === 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
        setIsPulling(distance > threshold);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && !isRefreshing) {
        handleRefresh();
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, threshold]);

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200"
        style={{
          height: Math.min(pullDistance, threshold),
          transform: `translateY(-${Math.min(pullDistance, threshold)}px)`,
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div
              className={cn(
                "w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full transition-all",
                (isRefreshing || isPulling) && "animate-spin"
              )}
            />
            <span className="text-sm">
              {isRefreshing ? "Refreshing..." : isPulling ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ paddingTop: Math.min(pullDistance, threshold) }}>
        {children}
      </div>
    </div>
  );
}

export { MobileActionSheet, MobileActionItem, MobileSwipeArea, MobilePullToRefresh };