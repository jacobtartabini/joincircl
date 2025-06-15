
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span className={cn(
      "bg-gradient-to-r from-[#0daeec] to-[#9c40ff] bg-clip-text text-transparent font-extrabold",
      className
    )}>
      {children}
    </span>
  );
}
