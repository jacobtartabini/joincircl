
import React, { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays, differenceInMonths } from 'date-fns';
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Video, 
  Star,
  Phone,
  FileText,
  Clock
} from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keystone } from '@/types/keystone';
import { Interaction, Contact } from '@/types/contact';

// Combined timeline event type
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'keystone' | 'interaction';
  description?: string;
  category?: string;
  icon: React.ReactNode;
  sourceType?: string;
}

interface HorizontalTimelineProps {
  contact: Contact;
  keystones: Keystone[];
  interactions: Interaction[];
  onEventClick?: (event: TimelineEvent) => void;
}

type TimeRange = 'all' | 'month' | 'quarter' | 'year';
type EventType = 'all' | 'keystone' | 'interaction' | 'note' | 'meeting' | 'email' | 'call';

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
  contact,
  keystones = [],
  interactions = [],
  onEventClick
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType>('all');
  
  // Convert keystones and interactions to unified timeline events
  const allTimelineEvents: TimelineEvent[] = useMemo(() => {
    const events = [
      ...keystones.map(keystone => ({
        id: keystone.id,
        date: keystone.date,
        title: keystone.title,
        type: 'keystone' as const,
        description: keystone.notes,
        category: keystone.category,
        icon: <Star size={18} className="text-amber-500" />,
        sourceType: 'Keystone'
      })),
      ...interactions.map(interaction => {
        let icon;
        switch(interaction.type) {
          case 'note':
            icon = <FileText size={18} className="text-green-600" />;
            break;
          case 'meeting':
            icon = <Calendar size={18} className="text-blue-600" />;
            break;
          case 'call':
            icon = <Phone size={18} className="text-purple-600" />;
            break;
          case 'email':
            icon = <Mail size={18} className="text-red-600" />;
            break;
          case 'video':
            icon = <Video size={18} className="text-indigo-600" />;
            break;
          default:
            icon = <MessageSquare size={18} className="text-gray-600" />;
        }
        
        return {
          id: interaction.id,
          date: interaction.date,
          title: `${interaction.type.charAt(0).toUpperCase()}${interaction.type.slice(1)}`,
          type: 'interaction' as const,
          description: interaction.notes,
          category: interaction.type,
          icon,
          sourceType: interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)
        };
      })
    ];
    
    // Sort events by date (past to present)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [keystones, interactions]);
  
  // Apply filters
  const filteredEvents = useMemo(() => {
    let filteredByTime = [...allTimelineEvents];
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      filteredByTime = filteredByTime.filter(event => {
        const eventDate = new Date(event.date);
        switch (timeRange) {
          case 'month':
            return differenceInDays(now, eventDate) <= 30;
          case 'quarter':
            return differenceInDays(now, eventDate) <= 90;
          case 'year':
            return differenceInMonths(now, eventDate) <= 12;
          default:
            return true;
        }
      });
    }
    
    // Apply event type filter
    if (eventTypeFilter !== 'all') {
      return filteredByTime.filter(event => {
        if (eventTypeFilter === 'keystone') return event.type === 'keystone';
        if (eventTypeFilter === 'interaction') return event.type === 'interaction';
        // Filter by specific interaction types
        return event.type === 'interaction' && event.category === eventTypeFilter;
      });
    }
    
    return filteredByTime;
  }, [allTimelineEvents, timeRange, eventTypeFilter]);
  
  // Generate insights based on events
  const insights = useMemo(() => {
    const insights = [];
    
    // Check last communication
    if (interactions.length > 0) {
      const now = new Date();
      const lastInteraction = [...interactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      const daysSinceLastInteraction = differenceInDays(now, new Date(lastInteraction.date));
      
      if (daysSinceLastInteraction > 90) {
        insights.push(`You haven't connected with ${contact.name} in ${Math.floor(daysSinceLastInteraction/30)} months.`);
      } else if (daysSinceLastInteraction > 30) {
        insights.push(`It's been over a month since you last connected with ${contact.name}.`);
      }
    }
    
    // Check upcoming keystones
    const upcomingKeystones = keystones.filter(keystone => {
      const keystoneDate = new Date(keystone.date);
      return keystoneDate > new Date();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (upcomingKeystones.length > 0) {
      const nextKeystone = upcomingKeystones[0];
      const daysUntil = differenceInDays(new Date(nextKeystone.date), new Date());
      
      if (daysUntil <= 7) {
        insights.push(`${nextKeystone.title} is coming up in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`);
      }
    }
    
    return insights;
  }, [contact, interactions, keystones]);
  
  // Group events by month for visualization
  const eventGroups = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.date);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(event);
    });
    
    return Object.entries(groups).map(([monthYear, events]) => ({
      label: monthYear,
      events
    }));
  }, [filteredEvents]);
  
  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-muted/40 border border-muted p-3 rounded-md mb-4 text-sm">
          <h4 className="font-medium mb-2">Insights</h4>
          <ul className="space-y-1 text-muted-foreground">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex items-center">
                <Clock size={14} className="mr-2 text-primary" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div>
          <h4 className="text-xs font-medium mb-1">Time Range</h4>
          <div className="flex gap-1">
            {(['all', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
              <Button 
                key={range}
                size="sm"
                variant={timeRange === range ? "default" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => setTimeRange(range)}
              >
                {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="ml-auto">
          <h4 className="text-xs font-medium mb-1">Event Type</h4>
          <div className="flex gap-1">
            {(['all', 'keystone', 'meeting', 'call', 'email', 'note'] as EventType[]).map((type) => (
              <Button 
                key={type}
                size="sm"
                variant={eventTypeFilter === type ? "default" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => setEventTypeFilter(type)}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + (type === 'keystone' ? 's' : 's')}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Timeline Visualization */}
      {filteredEvents.length > 0 ? (
        <div className="mt-6">
          <Carousel 
            opts={{
              align: "start",
              dragFree: true
            }}
            className="w-full"
          >
            <CarouselContent>
              {eventGroups.map((group, groupIndex) => (
                <CarouselItem key={group.label} className="basis-full sm:basis-1/2 md:basis-1/3">
                  <div className="p-1">
                    <h3 className="font-medium text-sm sticky top-0 bg-background/90 backdrop-blur-sm pb-2 mb-2 border-b">
                      {group.label}
                    </h3>
                    <ScrollArea className="h-[300px] pr-3">
                      <div className="space-y-3 pr-2">
                        {group.events.map((event) => (
                          <div 
                            key={`${event.type}-${event.id}`}
                            onClick={() => handleEventClick(event)}
                            className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                          >
                            <div className="mt-1 flex-shrink-0">
                              {event.icon}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-sm">{event.title}</p>
                                <Badge variant="outline" className="h-5 text-xs px-1.5">
                                  {event.sourceType}
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.date), 'PPP')}
                              </p>
                              
                              {event.description && (
                                <p className="text-sm line-clamp-2 text-muted-foreground">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0 h-8 w-8" />
              <CarouselNext className="static translate-y-0 h-8 w-8" />
            </div>
          </Carousel>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No events in the timeline.</p>
          <p className="text-sm">Add keystones or log interactions to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default HorizontalTimeline;
