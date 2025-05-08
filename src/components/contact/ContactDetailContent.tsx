
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactKeystones from "@/components/contact/ContactKeystones";
import ContactInteractions from "@/components/contact/ContactInteractions";
import ContactMediaSection from "@/components/contact/ContactMediaSection";

interface ContactDetailContentProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onKeystoneAdded: () => Promise<void>;
  onInteractionAdded: () => Promise<void>;
}

export default function ContactDetailContent({
  contact,
  interactions,
  keystones,
  contactMedia,
  onKeystoneAdded,
  onInteractionAdded
}: ContactDetailContentProps) {
  const connectionStrength = calculateConnectionStrength(contact, interactions);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column (2/3 width) */}
      <div className="md:col-span-2 space-y-6">
        {/* Contact Info Card */}
        <ContactInfo contact={contact} />
        
        {/* Media section - conditionally rendered */}
        {(contactMedia.length > 0) && (
          <div className="mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">FILES & MEDIA</h3>
            <ContactMediaSection media={contactMedia} />
          </div>
        )}
        
        {/* Keystones */}
        <ContactKeystones 
          keystones={keystones} 
          contact={contact} 
          onKeystoneAdded={onKeystoneAdded} 
        />
        
        {/* Interactions */}
        <ContactInteractions 
          interactions={interactions} 
          contact={contact} 
          onInteractionAdded={onInteractionAdded} 
        />
      </div>
      
      {/* Right column (1/3 width) */}
      <div>
        {/* Connection Insights */}
        {connectionStrength && <ConnectionInsights strength={connectionStrength} />}
      </div>
    </div>
  );
}
