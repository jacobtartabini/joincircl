
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
        "flex min-h-[80px] w-full rounded-xl border-2 border-white/40 dark:border-white/25 bg-white/50 dark:bg-white/8 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
GlassTextarea.displayName = "GlassTextarea";

export { GlassTextarea };
