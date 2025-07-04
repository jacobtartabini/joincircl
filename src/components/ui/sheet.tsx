
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t rounded-t-[16px] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
  VariantProps<typeof sheetVariants> { }

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);
  const [velocity, setVelocity] = React.useState(0);
  const [lastMoveTime, setLastMoveTime] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  
  // Enhanced touch events for smooth swipe-down gesture dismissal
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (side !== "bottom") return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setOffsetY(0);
    setVelocity(0);
    setLastMoveTime(Date.now());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || side !== "bottom") return;
    
    const currentY = e.touches[0].clientY;
    const currentTime = Date.now();
    const diff = currentY - startY;
    const timeDiff = currentTime - lastMoveTime;
    
    if (diff > 0) { // Only allow swiping down
      setOffsetY(diff);
      
      // Calculate velocity for momentum-based closing
      if (timeDiff > 0) {
        setVelocity(diff / timeDiff);
      }
      setLastMoveTime(currentTime);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || side !== "bottom") return;
    setIsDragging(false);
    
    // Close conditions: either swiped down enough distance OR has enough velocity
    const shouldClose = offsetY > 80 || (offsetY > 40 && velocity > 0.5);
    
    if (shouldClose && closeRef.current) {
      closeRef.current.click();
    }
    
    // Reset state
    setOffsetY(0);
    setVelocity(0);
  };
  
  // Apply transform style for drag effect with smooth animation
  const dragStyle = isDragging && side === "bottom" ? {
    transform: `translateY(${offsetY}px)`,
    transition: 'none'
  } : offsetY > 0 ? {
    transform: 'translateY(0px)',
    transition: 'transform 0.3s ease-out'
  } : {};

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={(el) => {
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
          contentRef.current = el;
        }}
        className={cn(sheetVariants({ side }), className)}
        style={dragStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Enhanced drag indicator for bottom sheets - more prominent for gesture discovery */}
        {side === "bottom" && (
          <div className="flex justify-center -mt-2 mb-4 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
          </div>
        )}
        
        {children}
        
        {/* Remove visible close button for non-bottom sheets to maintain clean UI */}
        {side !== "bottom" && (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary sr-only">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
        
        {/* Hidden close button for programmatic closing */}
        <SheetPrimitive.Close ref={closeRef} className="sr-only">
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold text-gray-900", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet, SheetClose,
  SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger
}
