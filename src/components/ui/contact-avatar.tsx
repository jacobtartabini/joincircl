
import { cn } from "@/lib/utils";
import { CircleBadge } from "./circle-badge";

interface ContactAvatarProps {
  name: string;
  avatarUrl?: string;
  circle: "inner" | "middle" | "outer";
  className?: string;
}

export const ContactAvatar = ({
  name,
  avatarUrl,
  circle,
  className
}: ContactAvatarProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="w-12 h-12 bg-circl-lightBlue/20 rounded-full flex items-center justify-center text-circl-blue font-medium">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <CircleBadge 
        type={circle} 
        className="absolute -bottom-1 -right-1 border border-white" 
      />
    </div>
  );
};
