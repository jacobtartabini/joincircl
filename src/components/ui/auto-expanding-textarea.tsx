
import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoExpandingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

const AutoExpandingTextarea = React.forwardRef<HTMLTextAreaElement, AutoExpandingTextareaProps>(
  ({ className, maxHeight = 120, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${scrollHeight}px`;
      }
    }, [maxHeight]);

    React.useEffect(() => {
      adjustHeight();
    }, [props.value, adjustHeight]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      props.onInput?.(e);
    };

    return (
      <textarea
        className={cn(
          "glass-input flex min-h-[44px] w-full rounded-xl border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none overflow-hidden",
          className
        )}
        ref={textareaRef}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
AutoExpandingTextarea.displayName = "AutoExpandingTextarea"

export { AutoExpandingTextarea }
