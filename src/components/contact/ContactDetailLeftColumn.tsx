
import ContactInfoSection from "./ContactInfoSection";
import ContactKeystonesSection from "./ContactKeystonesSection";
import ContactInteractionsSection from "./ContactInteractionsSection";
import ContactMediaSection from "./ContactMediaSection";
import ContactInsightsSection from "./ContactInsightsSection";
import SocialFeedSection from "./SocialFeedSection";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";

interface ContactDetailLeftColumnProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onKeystoneAdded: () => Promise<void>;
  onInteractionAdded: () => Promise<void>;
}

export default function ContactDetailLeftColumn({
  contact,
  interactions,
  keystones,
  contactMedia,
  onKeystoneAdded,
  onInteractionAdded
}: ContactDetailLeftColumnProps) {
  return (
    <div className="space-y-8">
      <div className="glass-card-enhanced">
        <ContactInfoSection contact={contact} />
      </div>
      
      <div className="glass-card-enhanced">
        <ContactKeystonesSection 
          contact={contact} 
          keystones={keystones} 
          onKeystoneAdded={onKeystoneAdded} 
        />
      </div>
      
      <div className="glass-card-enhanced">
        <ContactInteractionsSection 
          contact={contact} 
          interactions={interactions} 
          onInteractionAdded={onInteractionAdded} 
        />
      </div>
      
      <div className="glass-card-enhanced">
        <SocialFeedSection contactId={contact.id} />
      </div>
      
      <div className="glass-card-enhanced">
        <ContactMediaSection 
          contactId={contact.id} 
          contactMedia={contactMedia} 
        />
      </div>
      
      <div className="glass-card-enhanced">
        <ContactInsightsSection 
          contactId={contact.id} 
        />
      </div>
    </div>
  );
}
