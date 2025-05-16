
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ContactInfoSection from "@/components/contact/ContactInfoSection";
import ContactMediaSection from "@/components/contact/ContactMediaSection";
import ContactKeystonesSection from "@/components/contact/ContactKeystonesSection";
import ContactInteractionsSection from "@/components/contact/ContactInteractionsSection";
import ContactVisualizationsSection from "@/components/contact/ContactVisualizationsSection";

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
  const hasMedia = contactMedia.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Contact Info Card */}
      <ContactInfoSection contact={contact} />
      
      {/* Visualizations Section (Includes both Timeline and Relationship Map) */}
      <ContactVisualizationsSection 
        contact={contact} 
        keystones={keystones}
        interactions={interactions}
        onKeystoneAdded={onKeystoneAdded}
        onInteractionAdded={onInteractionAdded}
      />
      
      {/* Media section - conditionally rendered */}
      {hasMedia && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">FILES & MEDIA</h3>
          <ContactMediaSection media={contactMedia} />
        </div>
      )}
      
      {/* Keystones */}
      <ContactKeystonesSection 
        keystones={keystones} 
        contact={contact} 
        onKeystoneAdded={onKeystoneAdded} 
      />
      
      {/* Interactions */}
      <ContactInteractionsSection 
        interactions={interactions} 
        contact={contact} 
        onInteractionAdded={onInteractionAdded} 
      />
    </div>
  );
}
