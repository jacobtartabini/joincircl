
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
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {children}
      </div>
      
      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 -mx-6 px-6 -mb-6 pb-6">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-12 font-medium"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 font-medium bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
