
import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const GlassTextarea = React.forwardRef<
  HTMLTextAreaElement,
  GlassTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-2 border-white/60 dark:border-white/40 bg-white/60 dark:bg-white/10 backdrop-blur-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/80 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-lg shadow-white/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
GlassTextarea.displayName = "GlassTextarea";

export { GlassTextarea };
