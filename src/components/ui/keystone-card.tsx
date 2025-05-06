
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface KeystoneProps {
  id: string;
  title: string;
  date: string;  // Changed from Date to string to match backend
  category: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
}

interface KeystoneCardProps {
  keystone: KeystoneProps;
  className?: string;
  onClick?: (keystone: KeystoneProps) => void;
  onEdit?: () => void;
  isPast?: boolean;
}

export function KeystoneCard({
  keystone,
  className,
  onClick,
  onEdit,
  isPast,
}: KeystoneCardProps) {
  const handleClick = () => {
    if (onClick) onClick(keystone);
    else if (onEdit) onEdit();
  };

  // Parse the string date to a Date object for formatting
  const dateObject = new Date(keystone.date);

  return (
    <Card
      className={cn(
        "overflow-hidden card-hover cursor-pointer", 
        isPast && "opacity-70",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="min-w-12 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {format(dateObject, "MMM")}
            </div>
            <div className="text-2xl font-bold">
              {format(dateObject, "d")}
            </div>
          </div>
          <div>
            <div className="font-medium">{keystone.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 bg-circl-lightBlue/20 rounded-full flex items-center justify-center text-circl-blue text-xs">
                {keystone.contactAvatar ? (
                  <img
                    src={keystone.contactAvatar}
                    alt={keystone.contactName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  keystone.contactName.charAt(0)
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {keystone.contactName}
              </div>
            </div>
            <div className="mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {keystone.category}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
