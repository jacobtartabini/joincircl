import * as React from "react";
import { cn } from "@/lib/utils";

export interface EnhancedMobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const EnhancedMobileInput = React.forwardRef<HTMLInputElement, EnhancedMobileInputProps>(
  ({ className, type, label, error, helpText, ...props }, ref) => {
    const inputId = React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "glass-input flex h-12 w-full px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500 mobile-tap-target",
            error && "border-destructive/60 focus-visible:ring-destructive/20",
            className
          )}
          style={{
            background: error 
              ? 'rgba(239, 68, 68, 0.05)' 
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            border: error 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: error 
              ? '0 4px 16px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
          }}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

EnhancedMobileInput.displayName = "EnhancedMobileInput";

export { EnhancedMobileInput };