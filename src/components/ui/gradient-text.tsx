import { cn } from "@/lib/utils"
import * as React from "react"
import { HTMLAttributes } from "react"

interface GradientTextProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Array of colors for the gradient
   * @default ["#3b82f6", "#60a5fa", "#2563eb"]
   */
  colors?: string[]
  /**
   * Animation duration in seconds
   * @default 8
   */
  animationSpeed?: number
  /**
   * Show animated border
   * @default false
   */
  showBorder?: boolean
}

export function GradientText({
  children,
  className,
  colors = ["#3b82f6", "#60a5fa", "#2563eb"], // blue tones
  animationSpeed = 8,
  showBorder = false,
  ...props
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  }

  return (
    <div
      className={cn(
        "relative flex max-w-fit flex-row items-center justify-start",
        "font-bold backdrop-blur transition-shadow duration-500",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      {showBorder && (
        <div
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
          style={{
            ...gradientStyle,
            backgroundSize: "300% 100%",
          }}
        >
          <div
            className="absolute inset-0 bg-background z-[-1]"
            style={{
              width: "calc(100% - 2px)",
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}
      <div
        className="inline-block relative z-2 text-transparent bg-cover animate-gradient"
        style={{
          ...gradientStyle,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundSize: "300% 100%",
        }}
      >
        {children}
      </div>
    </div>
  )
}
