
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import ContactInfoSection from "@/components/contact/ContactInfoSection";
import ContactMediaSection from "@/components/contact/ContactMediaSection";
import ContactKeystonesSection from "@/components/contact/ContactKeystonesSection";
import ContactInteractionsSection from "@/components/contact/ContactInteractionsSection";
import ContactVisualizationsSection from "@/components/contact/ContactVisualizationsSection";
import ContactTimeline from "@/components/visualizations/ContactTimeline";
import { useState } from "react";
import { KeystoneDetailModal } from "@/components/keystone/KeystoneDetailModal";
import InteractionDetailModal from "@/components/interaction/InteractionDetailModal";

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
  
  // State for timeline event detail modal
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [isKeystoneDetailOpen, setIsKeystoneDetailOpen] = useState(false);
  const [isInteractionDetailOpen, setIsInteractionDetailOpen] = useState(false);
  
  const handleTimelineEventClick = (event: any) => {
    if (event.type === 'keystone') {
      const keystone = keystones.find(k => k.id === event.id);
      if (keystone) {
        setSelectedKeystone(keystone);
        setIsKeystoneDetailOpen(true);
      }
    } else if (event.type === 'interaction') {
      const interaction = interactions.find(i => i.id === event.id);
      if (interaction) {
        setSelectedInteraction(interaction);
        setIsInteractionDetailOpen(true);
      }
    }
  };
  
  const handleEditKeystone = () => {
    setIsKeystoneDetailOpen(false);
    // Additional edit logic would go here
  };
  
  const handleDeleteKeystone = async () => {
    if (!selectedKeystone?.id) return;
    setIsKeystoneDetailOpen(false);
    await onKeystoneAdded();
    setSelectedKeystone(null);
  };
  
  const handleEditInteraction = () => {
    setIsInteractionDetailOpen(false);
    // Additional edit logic would go here
  };
  
  const handleDeleteInteraction = async () => {
    if (!selectedInteraction?.id) return;
    setIsInteractionDetailOpen(false);
    await onInteractionAdded();
    setSelectedInteraction(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Contact Info Card */}
      <ContactInfoSection contact={contact} />
      
      {/* Relationship Map Visualization */}
      <ContactVisualizationsSection contact={contact} />
      
      {/* Timeline Visualization */}
      <ContactTimeline 
        contact={contact}
        keystones={keystones}
        interactions={interactions}
        onEventClick={handleTimelineEventClick}
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
      
      {/* Modals for timeline event details */}
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isKeystoneDetailOpen}
        onOpenChange={setIsKeystoneDetailOpen}
        onEdit={handleEditKeystone}
        onDelete={handleDeleteKeystone}
      />
      
      <InteractionDetailModal
        interaction={selectedInteraction}
        isOpen={isInteractionDetailOpen}
        onOpenChange={setIsInteractionDetailOpen}
        onEdit={handleEditInteraction}
        onDelete={handleDeleteInteraction}
      />
    </div>
  );
}
