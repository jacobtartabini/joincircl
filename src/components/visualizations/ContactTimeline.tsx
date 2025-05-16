
import React, { useState } from 'react';
import { Keystone } from "@/types/keystone";
import { Interaction, Contact } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageCircle, Clock, Mail, Video, Phone, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define email interaction type
interface EmailInteraction {
  id: string;
  date: string;
  type: 'email';
  subject: string;
  preview: string;
  provider: 'gmail' | 'outlook';
  contact_id: string;
  user_id: string;
}

// Define calendar event type
interface CalendarEvent {
  id: string;
  date: string;
  type: 'calendar';
  title: string;
  location?: string;
  description?: string;
  attendees?: string[];
  provider: 'gmail' | 'outlook';
  contact_id: string;
  user_id: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'keystone' | 'interaction' | 'email' | 'calendar';
  description?: string;
  category?: string;
  icon: React.ReactNode;
  provider?: 'gmail' | 'outlook';
}

interface ContactTimelineProps {
  contact: Contact;
  keystones: Keystone[];
  interactions: Interaction[];
  emails?: EmailInteraction[];
  calendarEvents?: CalendarEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

const ContactTimeline: React.FC<ContactTimelineProps> = ({
  contact,
  keystones = [],
  interactions = [],
  emails = [],
  calendarEvents = [],
  onEventClick
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  
  // Convert keystones, interactions, emails, and calendar events to unified timeline events
  const allTimelineEvents: TimelineEvent[] = [
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
    })),
    ...emails.map(email => ({
      id: email.id,
      date: email.date,
      title: email.subject,
      type: 'email' as const,
      description: email.preview,
      provider: email.provider,
      icon: <Mail size={18} className="text-red-500" />
    })),
    ...calendarEvents.map(event => ({
      id: event.id,
      date: event.date,
      title: event.title,
      type: 'calendar' as const,
      description: event.description,
      provider: event.provider,
      category: event.location,
      icon: <Video size={18} className="text-orange-500" />
    }))
  ];

  // Apply filters
  const filteredTimelineEvents = allTimelineEvents.filter(event => {
    // Filter by type
    if (filterType !== "all" && event.type !== filterType) {
      return false;
    }
    
    // Filter by provider (for emails and calendar events)
    if (filterProvider !== "all" && 
        (event.type === 'email' || event.type === 'calendar') && 
        event.provider !== filterProvider) {
      return false;
    }
    
    return true;
  });

  // Sort events by date (most recent first)
  filteredTimelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Get event icon based on type
  const getEventIcon = (event: TimelineEvent) => {
    switch(event.type) {
      case 'keystone':
        return <Calendar size={18} className="text-blue-600" />;
      case 'interaction':
        if (event.category === 'note') {
          return <MessageCircle size={18} className="text-green-600" />;
        } else if (event.category === 'call') {
          return <Phone size={18} className="text-purple-600" />;
        }
        return <Clock size={18} className="text-purple-600" />;
      case 'email':
        return <Mail size={18} className="text-red-500" />;
      case 'calendar':
        return <Video size={18} className="text-orange-500" />;
      default:
        return <Clock size={18} className="text-gray-500" />;
    }
  };

  // Get provider badge based on event provider
  const getProviderBadge = (event: TimelineEvent) => {
    if (!event.provider) return null;
    
    return (
      <Badge variant="outline" className="ml-1">
        {event.provider === 'gmail' ? 'Gmail' : 'Outlook'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Timeline</CardTitle>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter by type</SelectLabel>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="keystone">Keystones</SelectItem>
                  <SelectItem value="interaction">Interactions</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter by source</SelectLabel>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-accent">
                    <Filter size={16} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More filter options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTimelineEvents.length > 0 ? (
          <div className="relative space-y-4">
            {/* Vertical line through timeline */}
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-muted-foreground/20"></div>
            
            {filteredTimelineEvents.map((event, index) => (
              <div 
                key={`${event.type}-${event.id}`} 
                className={cn(
                  "relative pl-10 cursor-pointer hover:bg-muted/50 rounded-md py-2 transition-colors",
                )}
                onClick={() => handleEventClick(event)}
              >
                {/* Event indicator/icon */}
                <div className="absolute left-4 top-2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white z-10">
                  <div className="rounded-full p-1">{getEventIcon(event)}</div>
                </div>
                
                <div>
                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.date), 'PPP')}
                  </p>
                  
                  {/* Event title and category */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    {event.category && (
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                    )}
                    {getProviderBadge(event)}
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
            <p>No events match your current filters.</p>
            <p className="text-sm">Try adjusting your filters or add new interactions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactTimeline;
