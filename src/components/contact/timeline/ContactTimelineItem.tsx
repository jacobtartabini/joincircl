
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TimelineItem {
  id: string;
  type: "interaction" | "keystone" | "media";
  date: Date;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  data: Interaction | Keystone | ContactMedia;
}

interface ContactTimelineItemProps {
  item: TimelineItem;
  contact: Contact;
}

export function ContactTimelineItem({ item, contact }: ContactTimelineItemProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "green":
        return "bg-green-50 text-green-600 border-green-200";
      case "amber":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "purple":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d');
  };

  return (
    <div className="flex gap-3 pb-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className={`p-2 rounded-full border-2 ${getColorClasses(item.color)}`}>
          {item.icon}
        </div>
        <div className="w-px h-full bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-sm text-foreground line-clamp-1">
              {item.title}
            </h4>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {formatDate(item.date)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(item.date)}
              </span>
            </div>
          </div>
          
          {item.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs h-5">
              {item.type}
            </Badge>
            
            {item.type === "keystone" && "category" in item.data && (
              <Badge variant="secondary" className="text-xs h-5">
                {(item.data as Keystone).category}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
