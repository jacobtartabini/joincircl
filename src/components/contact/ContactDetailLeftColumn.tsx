
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
    <div className="space-y-6">
      <ContactInfoSection contact={contact} />
      <ContactKeystonesSection 
        contact={contact} 
        keystones={keystones} 
        onKeystoneAdded={onKeystoneAdded} 
      />
      <ContactInteractionsSection 
        contact={contact} 
        interactions={interactions} 
        onInteractionAdded={onInteractionAdded} 
      />
      <SocialFeedSection contactId={contact.id} />
      <ContactMediaSection 
        contact={contact} 
        contactMedia={contactMedia} 
      />
      <ContactInsightsSection 
        contact={contact} 
      />
    </div>
  );
}
