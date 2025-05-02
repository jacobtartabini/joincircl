
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface KeystoneProps {
  id: string;
  title: string;
  date: Date;
  category: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
}

interface KeystoneCardProps {
  keystone: KeystoneProps;
  className?: string;
  onClick?: (keystone: KeystoneProps) => void;
}

export function KeystoneCard({
  keystone,
  className,
  onClick,
}: KeystoneCardProps) {
  const handleClick = () => {
    if (onClick) onClick(keystone);
  };

  return (
    <Card
      className={cn("overflow-hidden card-hover cursor-pointer", className)}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="min-w-12 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {format(new Date(keystone.date), "MMM")}
            </div>
            <div className="text-2xl font-bold">
              {format(new Date(keystone.date), "d")}
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
