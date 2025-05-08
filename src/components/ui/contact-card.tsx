
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/contact";
import { useNavigate } from "react-router-dom";
import { ContactAvatar } from "./contact-avatar";
import { ContactInfo } from "./contact-info";
import { ContactActions } from "./contact-actions";
import { getFormattedLastContact } from "@/utils/date-utils";

interface ContactCardProps {
  contact: Contact;
  className?: string;
  onAddNote?: (contact: Contact) => void;
  onViewInsights?: (contact: Contact) => void;
  onMarkComplete?: (contact: Contact) => void;
}

export const ContactCard = ({
  contact,
  className,
  onAddNote,
  onViewInsights,
  onMarkComplete,
}: ContactCardProps) => {
  const navigate = useNavigate();
  
  const lastContactDate = contact.last_contact
    ? getFormattedLastContact(new Date(contact.last_contact))
    : null;

  const handleViewContact = () => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleViewInsights = () => {
    if (onViewInsights) {
      onViewInsights(contact);
    }
  };

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote(contact);
    }
  };

  return (
    <Card className={cn("overflow-hidden card-hover", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <ContactAvatar 
            name={contact.name} 
            avatarUrl={contact.avatar_url} 
            circle={contact.circle} 
          />
          <ContactInfo 
            contact={contact} 
            lastContactDate={lastContactDate} 
          />
        </div>
        <ContactActions 
          onView={handleViewContact}
          onViewInsights={onViewInsights ? handleViewInsights : undefined}
          onAddInteraction={onAddNote ? handleAddNote : undefined}
        />
      </CardContent>
    </Card>
  );
};
