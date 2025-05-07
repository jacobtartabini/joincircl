
import { cn } from "@/lib/utils";

type CircleType = "inner" | "middle" | "outer";

interface CircleBadgeProps {
  type: CircleType;
  className?: string;
}

export const getCircleColor = (type: CircleType) => {
  switch (type) {
    case "inner":
      return "bg-rose-500 text-white";
    case "middle":
      return "bg-amber-500 text-white";
    case "outer":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

export const getCircleName = (type: CircleType) => {
  switch (type) {
    case "inner":
      return "Inner";
    case "middle":
      return "Middle";
    case "outer":
      return "Outer";
    default:
      return "";
  }
};

export const CircleBadge = ({ type, className }: CircleBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full w-6 h-6 text-xs font-medium",
        getCircleColor(type),
        className
      )}
    >
      {type.charAt(0).toUpperCase()}
    </span>
  );
};
