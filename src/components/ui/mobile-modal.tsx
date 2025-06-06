
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function MobileModal({ isOpen, onClose, title, children, className }: MobileModalProps) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setOffsetY(0);
    setVelocity(0);
    setLastMoveTime(Date.now());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
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
    if (!isDragging) return;
    setIsDragging(false);
    
    // Close conditions: either swiped down enough distance OR has enough velocity
    const shouldClose = offsetY > 80 || (offsetY > 40 && velocity > 0.5);
    
    if (shouldClose) {
      onClose();
    }
    
    // Reset state
    setOffsetY(0);
    setVelocity(0);
  };

  if (!isMobile) {
    return null; // Use regular dialog on desktop
  }

  // Apply transform style for drag effect
  const dragStyle = isDragging ? {
    transform: `translateY(${offsetY}px)`,
    transition: 'none'
  } : offsetY > 0 ? {
    transform: 'translateY(0px)',
    transition: 'transform 0.3s ease-out'
  } : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col",
              className
            )}
            style={dragStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Enhanced Drag Handle - more prominent for gesture discovery */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
            </div>
            
            {/* Header - remove visible close button */}
            {title && (
              <div className="flex items-center justify-center px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
