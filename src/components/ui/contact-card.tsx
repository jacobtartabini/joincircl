
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleBadge, getCircleName } from "./circle-badge";
import { Eye, BarChart, MessageSquare, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/contact";
import { Link, useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";

interface ContactCardProps {
  contact: Contact;
  className?: string;
  onAddNote: () => void;
  onViewInsights: () => void;
  onMarkComplete: () => void;
}

export const ContactCard = ({
  contact,
  className,
  onAddNote,
  onViewInsights,
  onMarkComplete,
}: ContactCardProps) => {
  const navigate = useNavigate();
  const daysSinceLastContact = contact.last_contact
    ? getFormattedLastContact(new Date(contact.last_contact))
    : null;

  const handleViewContact = () => {
    navigate(`/contacts/${contact.id}`);
  };

  return (
    <Card className={cn("overflow-hidden card-hover", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-circl-lightBlue/20 rounded-full flex items-center justify-center text-circl-blue font-medium">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
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
                <Link to={`/contacts/${contact.id}`}>
                  <h3 className="font-medium hover:text-blue-600">{contact.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {getCircleName(contact.circle)} Circle
                </p>
              </div>
              {daysSinceLastContact !== null && (
                <div className="text-xs text-muted-foreground">
                  {daysSinceLastContact}
                </div>
              )}
            </div>
            
            <div className="mt-1 flex flex-wrap items-center text-xs text-muted-foreground gap-x-3">
              {contact.job_title && contact.company_name && (
                <div className="flex items-center">
                  <Briefcase size={12} className="mr-1" />
                  <span className="truncate max-w-[150px]" title={`${contact.job_title} at ${contact.company_name}`}>
                    {contact.job_title}, {contact.company_name}
                  </span>
                </div>
              )}
              
              {contact.location && (
                <div className="flex items-center">
                  <MapPin size={12} className="mr-1" />
                  <span className="truncate max-w-[120px]" title={contact.location}>
                    {contact.location}
                  </span>
                </div>
              )}
            </div>
            
            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {contact.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {contact.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                    +{contact.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMarkComplete()}
          >
            <Eye size={16} className="mr-1" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewInsights()}
          >
            <BarChart size={16} className="mr-1" /> Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAddNote()}
          >
            <MessageSquare size={16} className="mr-1" /> Interaction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function getFormattedLastContact(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, 'MMM d');
  }
}
