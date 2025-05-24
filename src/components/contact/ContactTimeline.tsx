
import { Clock, Hash, Coffee, MessageSquare, Bell, FileText, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { ContactTimelineHeader } from "./timeline/ContactTimelineHeader";
import { ContactTimelineItem } from "./timeline/ContactTimelineItem";

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
  const [filter, setFilter] = useState("all");
  
  // Helper functions defined before useMemo
  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call": return <Clock className="h-4 w-4 text-blue-500" />;
      case "meeting": return <Coffee className="h-4 w-4 text-green-500" />;
      case "email": return <Mail className="h-4 w-4 text-blue-500" />;
      case "message": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Hash className="h-4 w-4 text-gray-500" />;
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
        title: `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} with ${contact.name}`,
        description: interaction.notes || "No notes provided",
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
        description: keystone.notes || `Keystone reminder for ${contact.name}`,
        icon: <Bell className="h-4 w-4 text-amber-500" />,
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
        title: `Media: ${media.file_name}`,
        description: `${media.file_type} file shared with ${contact.name}`,
        icon: <FileText className="h-4 w-4 text-purple-500" />,
        color: "purple",
        data: media
      });
    });
    
    // Sort by date (most recent first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [contact, interactions, keystones, contactMedia]);
  
  // Group timeline items by date
  const groupedItems = useMemo(() => {
    return timelineItems.reduce((acc, item) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateGroup: string;
      const itemDate = new Date(item.date);
      
      if (itemDate.toDateString() === today.toDateString()) {
        dateGroup = "TODAY";
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        dateGroup = "YESTERDAY";
      } else {
        dateGroup = "LAST WEEK";
      }
      
      if (!acc[dateGroup]) {
        acc[dateGroup] = [];
      }
      
      acc[dateGroup].push(item);
      return acc;
    }, {} as Record<string, TimelineItem[]>);
  }, [timelineItems]);

  return (
    <div className="h-full flex flex-col">
      <ContactTimelineHeader 
        contact={contact}
        totalEvents={timelineItems.length}
        interactionCount={interactions.length}
        keystoneCount={keystones.length}
      />
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No timeline events yet</p>
            <p className="text-sm mt-1">Interactions, keystones, and media will appear here as you add them.</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-4">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground">{dateGroup}</h2>
              
              {items.map((item) => (
                <ContactTimelineItem 
                  key={item.id} 
                  item={item} 
                  contact={contact} 
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
