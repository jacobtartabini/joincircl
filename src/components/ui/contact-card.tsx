
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleBadge, getCircleName } from "./circle-badge";
import { Eye, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactProps {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  circle: "inner" | "middle" | "outer";
  lastContact?: Date;
  tags?: string[];
}

interface ContactCardProps {
  contact: ContactProps;
  className?: string;
  onAddNote?: (contact: ContactProps) => void;
  onViewInsights?: (contact: ContactProps) => void;
  onMarkComplete?: (contact: ContactProps) => void;
}

export const ContactCard = ({
  contact,
  className,
  onAddNote,
  onViewInsights,
  onMarkComplete,
}: ContactCardProps) => {
  const daysSinceLastContact = contact.lastContact
    ? Math.floor(
        (new Date().getTime() - new Date(contact.lastContact).getTime()) /
          (1000 * 3600 * 24)
      )
    : null;

  return (
    <Card className={cn("overflow-hidden card-hover", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-circl-lightBlue/20 rounded-full flex items-center justify-center text-circl-blue font-medium">
              {contact.avatar ? (
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                contact.name.charAt(0).toUpperCase()
              )}
            </div>
            <CircleBadge 
              type={contact.circle} 
              className="absolute -bottom-1 -right-1 border border-white" 
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {getCircleName(contact.circle)} Circle
                </p>
              </div>
              {daysSinceLastContact !== null && (
                <div className="text-xs text-muted-foreground">
                  {daysSinceLastContact === 0
                    ? "Today"
                    : daysSinceLastContact === 1
                    ? "Yesterday"
                    : `${daysSinceLastContact} days ago`}
                </div>
              )}
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAddNote && onAddNote(contact)}
          >
            <Plus size={16} className="mr-1" /> Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewInsights && onViewInsights(contact)}
          >
            <Eye size={16} className="mr-1" /> Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMarkComplete && onMarkComplete(contact)}
          >
            <Check size={16} className="mr-1" /> Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
