
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "glass-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/20 text-foreground hover:bg-white/30 border border-white/30 hover:scale-[1.01]",
        destructive:
          "bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/30 hover:scale-[1.01]",
        outline:
          "bg-white/10 border border-white/30 hover:bg-white/20 text-foreground hover:scale-[1.01]",
        secondary:
          "bg-white/15 text-foreground hover:bg-white/25 border border-white/25 hover:scale-[1.01]",
        ghost: "bg-transparent hover:bg-white/20 text-foreground border-transparent hover:scale-[1.01]",
        link: "text-primary underline-offset-4 hover:underline border-transparent bg-transparent backdrop-blur-none shadow-none",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-2xl",
        sm: "h-10 px-4 py-2 rounded-xl",
        lg: "h-14 px-8 py-4 rounded-3xl",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        }}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
