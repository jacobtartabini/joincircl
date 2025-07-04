import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Grid, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { format } from 'date-fns';
import { FullCalendar } from '@/components/calendar/FullCalendar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import KeystoneForm from '@/components/keystone/KeystoneForm';
import { ActionSearchBar } from '@/components/ui/action-search-bar';
import { useContacts } from '@/hooks/use-contacts';
import { useKeystones } from '@/hooks/use-keystones';
export default function Events() {
  const [view, setView] = useState<'calendar' | 'grid'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [prefilledEventData, setPrefilledEventData] = useState<{
    date?: string;
    time?: string;
    endDate?: string;
    endTime?: string;
  } | null>(null);
  const {
    events,
    isLoading
  } = useEvents();
  const {
    contacts
  } = useContacts();
  const {
    keystones
  } = useKeystones();
  const filteredEvents = events.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || event.contact_names?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) || event.category?.toLowerCase().includes(searchTerm.toLowerCase()) || event.type.toLowerCase().includes(searchTerm.toLowerCase()) || event.source.toLowerCase().includes(searchTerm.toLowerCase()) || format(new Date(event.date), 'PPP').toLowerCase().includes(searchTerm.toLowerCase()));

  // Transform events data for FullCalendar component
  const calendarData = events.map(event => ({
    day: new Date(event.date),
    events: [{
      id: event.id,
      name: event.title,
      time: event.time || format(new Date(event.date), 'HH:mm'),
      datetime: event.date,
      type: event.type as 'keystone' | 'interaction' | 'birthday' | 'sync' | 'calendar',
      contact_names: event.contact_names
    }]
  }));
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'keystone':
        return 'bg-blue-500';
      case 'interaction':
        return 'bg-green-500';
      case 'birthday':
        return 'bg-pink-500';
      case 'sync':
        return 'bg-yellow-500';
      case 'calendar':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getEventTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'keystone':
        return 'default' as const;
      case 'interaction':
        return 'success' as const;
      case 'birthday':
        return 'destructive' as const;
      case 'sync':
        return 'warning' as const;
      case 'calendar':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleDragCreate = (startDate: Date, endDate: Date, startTime?: string, endTime?: string) => {
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    setPrefilledEventData({
      date: startDateStr,
      time: startTime,
      endDate: endDateStr,
      endTime: endTime
    });
    
    setIsCreateEventOpen(true);
  };

  const handleNewEvent = (date?: Date, time?: string) => {
    const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
    setPrefilledEventData({
      date: dateStr,
      time: time
    });
    setIsCreateEventOpen(true);
  };

  const handleCloseEventForm = () => {
    setIsCreateEventOpen(false);
    setPrefilledEventData(null);
  };

  // Actions for the search bar
  const searchActions = [{
    id: 'add-event',
    label: 'Add New Event',
    icon: <Plus className="h-4 w-4" />,
    description: 'Create a new event or keystone',
    handler: () => handleNewEvent(),
    category: 'Actions'
  }, {
    id: 'calendar-view',
    label: 'Switch to Calendar View',
    icon: <Calendar className="h-4 w-4" />,
    description: 'View events in calendar format',
    handler: () => setView('calendar'),
    category: 'Views'
  }, {
    id: 'grid-view',
    label: 'Switch to Grid View',
    icon: <Grid className="h-4 w-4" />,
    description: 'View events in grid format',
    handler: () => setView('grid'),
    category: 'Views'
  }];
  return <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your events and calendar</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-80">
            <ActionSearchBar actions={searchActions} contacts={contacts} keystones={keystones} placeholder="Search events, contacts, or actions..." />
          </div>
          <Button size="sm" className="gap-2" onClick={() => handleNewEvent()}>
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')} className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setView('grid')} className="gap-2">
            <Grid className="h-4 w-4" />
            Grid
          </Button>
        </div>

        {view === 'grid'}
      </div>

      {/* Content */}
      {view === 'calendar' ? <div className="h-[calc(100vh-16rem)]">
          <FullCalendar 
            data={calendarData} 
            onNewEvent={handleNewEvent}
            onDragCreate={handleDragCreate}
            onEventClick={event => console.log('Event clicked:', event)} 
          />
        </div> : <div className="space-y-4">
          {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({
          length: 6
        }).map((_, i) => <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>)}
            </div> : <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" layout>
              <AnimatePresence>
                {filteredEvents.map(event => <motion.div key={event.id} layout initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.9
          }} transition={{
            duration: 0.2
          }} className={expandedEvent === event.id ? 'col-span-full' : ''}>
                    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 h-fit" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg font-semibold line-clamp-2">
                            {event.title}
                          </CardTitle>
                          <Badge variant={getEventTypeBadgeVariant(event.type)} className="shrink-0">
                            {event.type}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                          {event.time && ` at ${event.time}`}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {event.contact_names && event.contact_names.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                            {event.contact_names.map((name, idx) => <Badge key={idx} variant="outline" className="text-xs">
                                {name}
                              </Badge>)}
                          </div>}
                        
                        {event.notes && <p className={`text-sm text-gray-600 dark:text-gray-300 ${expandedEvent === event.id ? '' : 'line-clamp-2'}`}>
                            {event.notes}
                          </p>}
                        
                        <motion.div initial={false} animate={expandedEvent === event.id ? {
                  opacity: 1,
                  height: 'auto'
                } : {
                  opacity: 0,
                  height: 0
                }} transition={{
                  duration: 0.2
                }} className="overflow-hidden">
                          {expandedEvent === event.id && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Source:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {event.source}
                                </Badge>
                              </div>
                              {event.category && <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Category:</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {event.category}
                                  </span>
                                </div>}
                              {event.is_recurring && <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Recurring:</span>
                                  <Badge variant="outline" className="text-xs">
                                    Yes
                                  </Badge>
                                </div>}
                            </div>}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </AnimatePresence>
            </motion.div>}
          
          {!isLoading && filteredEvents.length === 0 && <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No events found.</p>
            </div>}
        </div>}

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={handleCloseEventForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <KeystoneForm 
            prefilledData={prefilledEventData}
            onSuccess={handleCloseEventForm} 
            onCancel={handleCloseEventForm} 
          />
        </DialogContent>
      </Dialog>
    </div>;
}