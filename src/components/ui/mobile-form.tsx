
import { ReactNode, FormEvent } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MobileFormProps {
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
  className?: string;
}

export function MobileForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  submitLabel = "Save",
  children, 
  className 
}: MobileFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 mobile-scroll">
        {children}
      </div>
      
      {/* Enhanced Sticky Footer with Glass Design */}
      <div className="sticky bottom-0 pt-6 border-t border-border/20 -mx-6 px-6 -mb-6 pb-6 glass-card">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-12 font-medium mobile-tap-target"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="flex-1 h-12 font-medium mobile-tap-target"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
