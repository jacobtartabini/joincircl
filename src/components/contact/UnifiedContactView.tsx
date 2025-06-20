
import React from 'react';
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ContactInfo from "./ContactInfo";
import ContactInteractions from "./ContactInteractions";
import ContactKeystones from "./ContactKeystones";
import ContactMediaSection from "./ContactMediaSection";
import ContactDetailHeader from "./ContactDetailHeader";

interface UnifiedContactViewProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onEdit: () => void;
  onDelete: () => void;
  onKeystoneAdded: () => void;
  onInteractionAdded: () => void;
}

export function UnifiedContactView({
  contact,
  interactions,
  keystones,
  contactMedia,
  onEdit,
  onDelete,
  onKeystoneAdded,
  onInteractionAdded
}: UnifiedContactViewProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header with navigation and actions */}
        <ContactDetailHeader 
          onEditClick={onEdit}
          onDeleteClick={onDelete}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Contact Info (includes map) */}
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
              <ContactMediaSection contactId={contact.id} contactMedia={contactMedia} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
