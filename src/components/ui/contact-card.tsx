
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";
import { MessageCircle, MessageSquarePlus, Eye, LineChart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";

export interface ContactCardProps {
  contact: Contact;
  className?: string;
  onAddInteraction?: (contact: Contact) => void;
  onViewInsights?: (contact: Contact) => void;
  onMarkComplete?: (contact: Contact) => void;
}

export const ContactCard = ({
  contact,
  className,
  onAddInteraction,
  onViewInsights,
  onMarkComplete,
}: ContactCardProps) => {
  const navigate = useNavigate();
  const daysSinceLastContact = contact.last_contact
    ? getFormattedLastContact(new Date(contact.last_contact))
    : "No recent contact";

  const handleViewClick = () => {
    navigate(`/contacts/${contact.id}`);
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow",
        className
      )}
    >
      <div className="flex flex-col p-5">
        <div className="flex items-start justify-between mb-3">
          <Avatar className="h-12 w-12 mr-4">
            {contact.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact.name} />
            ) : (
              <AvatarFallback>
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-none tracking-tight truncate">
              {contact.name}
            </h3>
            {contact.job_title && contact.company_name && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {contact.job_title} at {contact.company_name}
              </p>
            )}
            {(!contact.job_title && contact.company_name) && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {contact.company_name}
              </p>
            )}
            {(contact.job_title && !contact.company_name) && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {contact.job_title}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "ml-1 capitalize",
              contact.circle === "inner"
                ? "border-blue-400 text-blue-500"
                : contact.circle === "middle"
                ? "border-amber-400 text-amber-500"
                : "border-green-400 text-green-500"
            )}
          >
            {contact.circle} Circle
          </Badge>
        </div>
        
        <div className="mt-2 flex items-center text-sm">
          <Calendar size={14} className="mr-1 text-muted-foreground" />
          <span className={cn("text-muted-foreground", !contact.last_contact && "italic")}>
            {daysSinceLastContact}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/80 to-transparent rounded-lg transition-opacity">
        <div className="flex gap-1 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white/90 hover:bg-white text-black"
            onClick={() => onAddInteraction && onAddInteraction(contact)}
          >
            <MessageSquarePlus size={16} className="mr-1" /> Interaction
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white/90 hover:bg-white text-black"
            onClick={() => onViewInsights && onViewInsights(contact)}
          >
            <LineChart size={16} className="mr-1" /> Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white/90 hover:bg-white text-black"
            onClick={handleViewClick}
          >
            <Eye size={16} className="mr-1" /> View
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format last contact date
function getFormattedLastContact(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }
  
  const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return `${daysDiff} day${daysDiff === 1 ? "" : "s"} ago`;
  } else if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else {
    return format(date, "MMM d, yyyy");
  }
}
