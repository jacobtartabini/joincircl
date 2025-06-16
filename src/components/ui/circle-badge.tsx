
import { cn } from "@/lib/utils";
import { Users, UserRound, User } from "lucide-react";

type CircleType = "inner" | "middle" | "outer";

interface CircleBadgeProps {
  type: CircleType;
  className?: string;
}

export const getCircleColor = (type: CircleType) => {
  switch (type) {
    case "inner":
      return "bg-[#2664EB] text-white";
    case "middle":
      return "bg-[#16A34A] text-white";
    case "outer":
      return "bg-[#9CA3AF] text-white";
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

// Add the Icons export
export const Icons = {
  inner: UserRound,
  middle: User,
  outer: Users
};
