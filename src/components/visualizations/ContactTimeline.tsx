
import React from 'react';
import { Keystone } from "@/types/keystone";
import { Interaction, Contact } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'keystone' | 'interaction';
  description?: string;
  category?: string;
  icon: React.ReactNode;
}

interface ContactTimelineProps {
  contact: Contact;
  keystones: Keystone[];
  interactions: Interaction[];
  onEventClick?: (event: TimelineEvent) => void;
}

const ContactTimeline: React.FC<ContactTimelineProps> = ({
  contact,
  keystones = [],
  interactions = [],
  onEventClick
}) => {
  // Convert keystones and interactions to unified timeline events
  const timelineEvents: TimelineEvent[] = [
    ...keystones.map(keystone => ({
      id: keystone.id,
      date: keystone.date,
      title: keystone.title,
      type: 'keystone' as const,
      description: keystone.notes,
      category: keystone.category,
      icon: <Calendar size={18} className="text-blue-600" />
    })),
    ...interactions.map(interaction => ({
      id: interaction.id,
      date: interaction.date,
      title: `${interaction.type.charAt(0).toUpperCase()}${interaction.type.slice(1)}`,
      type: 'interaction' as const,
      description: interaction.notes,
      category: interaction.type,
      icon: interaction.type === 'note' 
        ? <MessageCircle size={18} className="text-green-600" /> 
        : <Clock size={18} className="text-purple-600" />
    }))
  ];

  // Sort events by date (most recent first)
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length > 0 ? (
          <div className="relative space-y-4">
            {/* Vertical line through timeline */}
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-muted-foreground/20"></div>
            
            {timelineEvents.map((event, index) => (
              <div 
                key={`${event.type}-${event.id}`} 
                className={cn(
                  "relative pl-10 cursor-pointer hover:bg-muted/50 rounded-md py-2 transition-colors",
                )}
                onClick={() => handleEventClick(event)}
              >
                {/* Event indicator/icon */}
                <div className="absolute left-4 top-2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white z-10">
                  <div className="rounded-full p-1">{event.icon}</div>
                </div>
                
                <div>
                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.date), 'PPP')}
                  </p>
                  
                  {/* Event title and category */}
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    {event.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {event.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Event description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No events in the timeline yet.</p>
            <p className="text-sm">Add keystones or log interactions to see them here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactTimeline;
