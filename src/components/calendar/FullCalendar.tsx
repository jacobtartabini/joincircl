import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays, startOfYear, endOfYear, addYears, subYears, eachMonthOfInterval } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import { UnifiedEvent } from '@/types/events';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EventForm } from '@/components/events/EventForm';
import KeystoneForm from '@/components/keystone/KeystoneForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
type CalendarView = 'day' | 'week' | 'month' | 'year';
interface FullCalendarProps {
  onCreateEvent?: (date: Date, time?: string) => void;
}
export function FullCalendar({
  onCreateEvent
}: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);
  const {
    events,
    isLoading
  } = useEvents();
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
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };
  const handleDoubleClick = (date: Date, time?: string) => {
    setPrefilledDate(date);
    setPrefilledTime(time);
    setIsCreateEventOpen(true);
    onCreateEvent?.(date, time);
  };
  const handleEventClick = (event: UnifiedEvent) => {
    setSelectedEvent(event);
  };
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'day':
        setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(direction === 'next' ? addYears(currentDate, 1) : subYears(currentDate, 1));
        break;
    }
  };
  const getDateRange = () => {
    switch (view) {
      case 'day':
        return [currentDate];
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return eachDayOfInterval({
          start: weekStart,
          end: weekEnd
        });
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({
          start: calendarStart,
          end: calendarEnd
        });
      case 'year':
        return eachMonthOfInterval({
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        });
    }
  };
  const renderDayView = () => {
    const hours = Array.from({
      length: 24
    }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate);
    return <div className="flex-1 overflow-auto">
        <div className="grid grid-rows-24 gap-0 min-h-full">
          {hours.map(hour => {
          const timeEvents = dayEvents.filter(event => {
            if (!event.time) return false;
            const eventHour = parseInt(event.time.split(':')[0]);
            return eventHour === hour;
          });
          return <div key={hour} className="border-b border-gray-200 dark:border-gray-700 p-2 min-h-[60px] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onDoubleClick={() => handleDoubleClick(currentDate, `${hour.toString().padStart(2, '0')}:00`)}>
                <div className="text-xs text-gray-500 mb-1">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                {timeEvents.map(event => <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <div className={`${getEventTypeColor(event.type)} text-white text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80`} onClick={() => handleEventClick(event)}>
                        {event.title}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">{format(new Date(event.date), 'PPP')} {event.time && `at ${event.time}`}</p>
                        {event.notes && <p className="text-sm">{event.notes}</p>}
                        {event.contact_names && event.contact_names.length > 0 && <div className="flex flex-wrap gap-1">
                            {event.contact_names.map((name, idx) => <Badge key={idx} variant="outline" className="text-xs">{name}</Badge>)}
                          </div>}
                      </div>
                    </PopoverContent>
                  </Popover>)}
              </div>;
        })}
        </div>
      </div>;
  };
  const renderWeekView = () => {
    const weekDays = getDateRange() as Date[];
    const hours = Array.from({
      length: 24
    }, (_, i) => i);
    return <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-0">
          <div className="border-r border-gray-200 dark:border-gray-700 p-2">
            <div className="text-sm font-medium text-gray-500">Time</div>
          </div>
          {weekDays.map(day => <div key={day.toISOString()} className="border-r border-gray-200 dark:border-gray-700 p-2">
              <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}>
                {format(day, 'EEE d')}
              </div>
            </div>)}
        </div>
        
        {hours.map(hour => <div key={hour} className="grid grid-cols-8 gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 text-xs text-gray-500 border-r border-gray-200 dark:border-gray-700">
              {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
            </div>
            {weekDays.map(day => {
          const dayEvents = getEventsForDate(day).filter(event => {
            if (!event.time) return false;
            const eventHour = parseInt(event.time.split(':')[0]);
            return eventHour === hour;
          });
          return <div key={`${day.toISOString()}-${hour}`} className="border-r border-gray-200 dark:border-gray-700 p-1 min-h-[50px] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onDoubleClick={() => handleDoubleClick(day, `${hour.toString().padStart(2, '0')}:00`)}>
                  {dayEvents.map(event => <Popover key={event.id}>
                      <PopoverTrigger asChild>
                        <div className={`${getEventTypeColor(event.type)} text-white text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80`} onClick={() => handleEventClick(event)}>
                          {event.title}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-600">{format(new Date(event.date), 'PPP')} {event.time && `at ${event.time}`}</p>
                          {event.notes && <p className="text-sm">{event.notes}</p>}
                        </div>
                      </PopoverContent>
                    </Popover>)}
                </div>;
        })}
          </div>)}
      </div>;
  };
  const renderMonthView = () => {
    const days = getDateRange() as Date[];
    const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
    return <div className="grid grid-cols-7 gap-0 flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-3 border-b border-gray-200 dark:border-gray-700 text-center font-medium text-gray-500">
            {day}
          </div>)}
        {days.map(day => {
        const dayEvents = getEventsForDate(day);
        return <div key={day.toISOString()} className={`
                min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700
                ${isCurrentMonth(day) ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
                ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
              `} onDoubleClick={() => handleDoubleClick(day)}>
              <div className={`text-sm font-medium mb-2 ${isCurrentMonth(day) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <div className={`${getEventTypeColor(event.type)} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate`} onClick={() => handleEventClick(event)}>
                        {event.title}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">{format(new Date(event.date), 'PPP')} {event.time && `at ${event.time}`}</p>
                        {event.notes && <p className="text-sm">{event.notes}</p>}
                        {event.contact_names && event.contact_names.length > 0 && <div className="flex flex-wrap gap-1">
                            {event.contact_names.map((name, idx) => <Badge key={idx} variant="outline" className="text-xs">{name}</Badge>)}
                          </div>}
                      </div>
                    </PopoverContent>
                  </Popover>)}
                {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>}
              </div>
            </div>;
      })}
      </div>;
  };
  const renderYearView = () => {
    const months = getDateRange() as Date[];
    return <div className="grid grid-cols-3 gap-4 p-4 flex-1 overflow-auto">
        {months.map(month => {
        const monthEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === month.getMonth() && eventDate.getFullYear() === month.getFullYear();
        });
        return <Card key={month.toISOString()} className="cursor-pointer hover:shadow-md transition-shadow" onDoubleClick={() => handleDoubleClick(month)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{format(month, 'MMMM')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-2">{monthEvents.length} events</div>
                <div className="space-y-1">
                  {monthEvents.slice(0, 3).map(event => <div key={event.id} className="text-xs p-1 bg-gray-100 dark:bg-gray-800 rounded truncate">
                      {event.title}
                    </div>)}
                  {monthEvents.length > 3 && <div className="text-xs text-gray-500">+{monthEvents.length - 3} more</div>}
                </div>
              </CardContent>
            </Card>;
      })}
      </div>;
  };
  const formatTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };
  if (isLoading) {
    return <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>;
  }
  return <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{formatTitle()}</h2>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {(['day', 'week', 'month', 'year'] as CalendarView[]).map(viewType => <Button key={viewType} variant={view === viewType ? 'default' : 'outline'} size="sm" onClick={() => setView(viewType)} className="capitalize">
                {viewType}
              </Button>)}
          </div>
          
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
        {view === 'year' && renderYearView()}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          {selectedEvent && <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(selectedEvent.type)}`} />
                <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
              </div>
              <div className="space-y-2">
                <p><strong>Date:</strong> {format(new Date(selectedEvent.date), 'PPP')}</p>
                {selectedEvent.time && <p><strong>Time:</strong> {selectedEvent.time}</p>}
                <p><strong>Type:</strong> {selectedEvent.type}</p>
                <p><strong>Source:</strong> {selectedEvent.source}</p>
                {selectedEvent.category && <p><strong>Category:</strong> {selectedEvent.category}</p>}
                {selectedEvent.contact_names && selectedEvent.contact_names.length > 0 && <div>
                    <strong>Contacts:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEvent.contact_names.map((name, idx) => <Badge key={idx} variant="outline">{name}</Badge>)}
                    </div>
                  </div>}
                {selectedEvent.notes && <div>
                    <strong>Notes:</strong>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selectedEvent.notes}</p>
                  </div>}
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <KeystoneForm onSuccess={() => setIsCreateEventOpen(false)} onCancel={() => setIsCreateEventOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>;
}