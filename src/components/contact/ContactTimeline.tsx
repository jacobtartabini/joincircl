
import { Clock, Hash, Coffee, MessageSquare, Bell, FileText, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { ContactTimelineHeader } from "./timeline/ContactTimelineHeader";
import { ContactTimelineItem } from "./timeline/ContactTimelineItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineItem {
  id: string;
  type: "interaction" | "keystone" | "media";
  date: Date;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  data: Interaction | Keystone | ContactMedia;
}

interface ContactTimelineProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
}

export function ContactTimeline({ contact, interactions, keystones, contactMedia }: ContactTimelineProps) {
  // Helper functions defined before useMemo
  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call": return <Clock className="h-3 w-3" />;
      case "meeting": return <Coffee className="h-3 w-3" />;
      case "email": return <Mail className="h-3 w-3" />;
      case "message": return <MessageSquare className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "call": return "blue";
      case "meeting": return "green";
      case "email": return "blue";
      case "message": return "purple";
      default: return "gray";
    }
  };
  
  // Convert all contact-related data into timeline items
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];
    
    // Add interactions
    interactions.forEach(interaction => {
      items.push({
        id: `interaction-${interaction.id}`,
        type: "interaction",
        date: new Date(interaction.date),
        title: `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}`,
        description: interaction.notes || undefined,
        icon: getInteractionIcon(interaction.type),
        color: getInteractionColor(interaction.type),
        data: interaction
      });
    });
    
    // Add keystones
    keystones.forEach(keystone => {
      items.push({
        id: `keystone-${keystone.id}`,
        type: "keystone",
        date: new Date(keystone.date),
        title: keystone.title,
        description: keystone.notes || undefined,
        icon: <Bell className="h-3 w-3" />,
        color: "amber",
        data: keystone
      });
    });
    
    // Add media
    contactMedia.forEach(media => {
      items.push({
        id: `media-${media.id}`,
        type: "media",
        date: new Date(media.created_at || Date.now()),
        title: media.file_name,
        description: `${media.file_type} file`,
        icon: <FileText className="h-3 w-3" />,
        color: "purple",
        data: media
      });
    });
    
    // Sort by date (most recent first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [contact, interactions, keystones, contactMedia]);

  return (
    <div className="h-full flex flex-col bg-card">
      <ContactTimelineHeader 
        contact={contact}
        totalEvents={timelineItems.length}
        interactionCount={interactions.length}
        keystoneCount={keystones.length}
      />
      
      {/* Timeline Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {timelineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No timeline events yet</p>
              <p className="text-xs mt-1">Activities will appear here as you add them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineItems.map((item) => (
                <ContactTimelineItem 
                  key={item.id} 
                  item={item} 
                  contact={contact} 
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
