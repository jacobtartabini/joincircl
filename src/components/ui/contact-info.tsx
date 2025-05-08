
import { Briefcase, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getCircleName } from "./circle-badge";
import { ContactTags } from "./contact-tags";
import { Contact } from "@/types/contact";

interface ContactInfoProps {
  contact: Contact;
  lastContactDate: string | null;
}

export const ContactInfo = ({ contact, lastContactDate }: ContactInfoProps) => {
  return (
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
        {lastContactDate !== null && (
          <div className="text-xs text-muted-foreground">
            {lastContactDate}
          </div>
        )}
      </div>
      
      <div className="mt-1 flex flex-wrap items-center text-xs text-muted-foreground gap-x-3">
        {contact.job_title && contact.company_name && (
          <div className="flex items-center">
            <Briefcase size={12} className="mr-1" />
            <span 
              className="truncate max-w-[150px]" 
              title={`${contact.job_title} at ${contact.company_name}`}
            >
              {contact.job_title}, {contact.company_name}
            </span>
          </div>
        )}
        
        {contact.location && (
          <div className="flex items-center">
            <MapPin size={12} className="mr-1" />
            <span 
              className="truncate max-w-[120px]" 
              title={contact.location}
            >
              {contact.location}
            </span>
          </div>
        )}
      </div>
      
      <ContactTags tags={contact.tags || []} />
    </div>
  );
};
