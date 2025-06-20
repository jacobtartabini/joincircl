
import React from 'react';
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ContactInfo from "./ContactInfo";
import ContactInteractions from "./ContactInteractions";
import ContactKeystones from "./ContactKeystones";
import ContactMediaSection from "./ContactMediaSection";

interface ContactDetailContentProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onKeystoneAdded: () => void;
  onInteractionAdded: () => void;
}

export default function ContactDetailContent({
  contact,
  interactions,
  keystones,
  contactMedia,
  onKeystoneAdded,
  onInteractionAdded
}: ContactDetailContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column - Contact Information (includes map) */}
      <div className="lg:col-span-1">
        <ContactInfo contact={contact} />
      </div>
      
      {/* Right column - Interactions and Keystones */}
      <div className="lg:col-span-2 space-y-6">
        <ContactInteractions 
          contactId={contact.id}
          interactions={interactions}
          onInteractionAdded={onInteractionAdded}
        />
        
        <ContactKeystones 
          contactId={contact.id}
          keystones={keystones}
          onKeystoneAdded={onKeystoneAdded}
        />
        
        {contactMedia.length > 0 && (
          <ContactMediaSection media={contactMedia} />
        )}
      </div>
    </div>
  );
}
