
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import ContactDetailLeftColumn from "@/components/contact/ContactDetailLeftColumn";
import ContactDetailRightColumn from "@/components/contact/ContactDetailRightColumn";

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
      <div className="md:col-span-2">
        <ContactDetailLeftColumn
          contact={contact}
          interactions={interactions}
          keystones={keystones}
          contactMedia={contactMedia}
          onKeystoneAdded={onKeystoneAdded}
          onInteractionAdded={onInteractionAdded}
        />
      </div>
      
      {/* Right column (1/3 width) */}
      <div>
        <ContactDetailRightColumn connectionStrength={connectionStrength} />
      </div>
    </div>
  );
}
