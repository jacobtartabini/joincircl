
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RelationshipMap from "@/components/visualizations/RelationshipMap";
import HorizontalTimeline from "@/components/visualizations/HorizontalTimeline";
import { Contact } from "@/types/contact";
import { useRelatedContacts } from "@/hooks/useRelatedContacts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Interaction } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { useState } from "react";
import { KeystoneDetailModal } from "@/components/keystone/KeystoneDetailModal";
import InteractionDetailModal from "@/components/interaction/InteractionDetailModal";

interface ContactVisualizationsSectionProps {
  contact: Contact;
  keystones: Keystone[];
  interactions: Interaction[];
  onKeystoneAdded: () => Promise<void>;
  onInteractionAdded: () => Promise<void>;
}

export default function ContactVisualizationsSection({ 
  contact, 
  keystones, 
  interactions,
  onKeystoneAdded,
  onInteractionAdded
}: ContactVisualizationsSectionProps) {
  const { relatedContacts } = useRelatedContacts(contact.id, 5);
  
  // State for timeline event detail modals
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Relationship Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="network">Network Position</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-0">
            <HorizontalTimeline 
              contact={contact} 
              keystones={keystones}
              interactions={interactions}
              onEventClick={handleTimelineEventClick}
            />
          </TabsContent>
          
          <TabsContent value="network" className="mt-0">
            <RelationshipMap contact={contact} relatedContacts={relatedContacts} />
            <div className="text-xs text-center text-muted-foreground mt-4">
              This visualization shows {contact.name}'s position in your network relative to other contacts.
            </div>
          </TabsContent>
        </Tabs>
        
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
      </CardContent>
    </Card>
  );
}
