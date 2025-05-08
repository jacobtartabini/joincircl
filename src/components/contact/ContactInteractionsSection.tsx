
import { Contact, Interaction } from "@/types/contact";
import ContactInteractions from "@/components/contact/ContactInteractions";

interface ContactInteractionsSectionProps {
  interactions: Interaction[];
  contact: Contact;
  onInteractionAdded: () => Promise<void>;
}

export default function ContactInteractionsSection({ 
  interactions, 
  contact, 
  onInteractionAdded 
}: ContactInteractionsSectionProps) {
  return (
    <ContactInteractions 
      interactions={interactions} 
      contact={contact} 
      onInteractionAdded={onInteractionAdded} 
    />
  );
}
