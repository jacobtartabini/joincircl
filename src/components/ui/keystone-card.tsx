
import { forwardRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface KeystoneCardProps {
  keystone: {
    id: string;
    title: string;
    date: string;
    category?: string;
    contactId?: string;
    contactName?: string;
    contactAvatar?: string;
  };
  className?: string;
  isPast?: boolean;
  onEdit?: () => void;
}

export const KeystoneCard = forwardRef<HTMLDivElement, KeystoneCardProps>((props, ref) => {
  const { keystone, isPast, className, onEdit } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "relative border rounded-md p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer",
        isPast && "bg-gray-50/50",
        className
      )}
      onClick={onEdit}
    >
      <div className="flex justify-between gap-2">
        <div className="flex-1">
          <h3 className={cn("font-medium mb-1", isPast && "text-muted-foreground")}>
            {keystone.title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(keystone.date), "PPP")}</span>
          </div>
          
          {keystone.contactId && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 overflow-hidden">
                {keystone.contactAvatar ? (
                  <img 
                    src={keystone.contactAvatar} 
                    alt={keystone.contactName || "Contact"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  keystone.contactName?.charAt(0) || "C"
                )}
              </div>
              <span className="text-sm">{keystone.contactName}</span>
            </div>
          )}
        </div>
        
        {keystone.category && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {keystone.category}
          </span>
        )}
      </div>
    </div>
  );
});

KeystoneCard.displayName = "KeystoneCard";
