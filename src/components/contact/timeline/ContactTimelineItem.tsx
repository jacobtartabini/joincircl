
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";

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
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar_url} alt={contact.name} />
          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.title}</span>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.date, { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">{item.description}</p>
          
          {item.type === "interaction" && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {(item.data as Interaction).type}
              </Badge>
            </div>
          )}
          
          {item.type === "keystone" && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {(item.data as Keystone).category || "General"}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
