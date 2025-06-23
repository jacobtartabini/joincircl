
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, User, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEvents } from '@/hooks/useEvents'
import { UnifiedEvent } from '@/types/events'
import { format, parseISO } from 'date-fns'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'

const EventCard = ({ event, isExpanded, onToggle }: { 
  event: UnifiedEvent
  isExpanded: boolean
  onToggle: () => void
}) => {
  const eventDate = parseISO(event.date)
  const formattedDate = format(eventDate, 'MMM dd, yyyy')
  const formattedTime = event.time || format(eventDate, 'HH:mm')

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'keystone': return 'bg-blue-500'
      case 'interaction': return 'bg-green-500'
      case 'birthday': return 'bg-purple-500'
      case 'sync': return 'bg-orange-500'
      case 'calendar': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'keystone': return 'Keystone'
      case 'interaction': return 'Interaction'
      case 'birthday': return 'Birthday'
      case 'sync': return 'Sync'
      case 'calendar': return 'Calendar'
      default: return 'Event'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        layout: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      className={`relative ${isExpanded ? 'col-span-full' : ''}`}
    >
      <Card 
        className="h-full cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
        onClick={onToggle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium line-clamp-2 mb-2">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs text-white ${getEventTypeColor(event.type)}`}
                >
                  {getEventTypeLabel(event.type)}
                </Badge>
                {event.source && (
                  <Badge variant="outline" className="text-xs">
                    {event.source}
                  </Badge>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
            </div>
            {event.contact_names && event.contact_names.length > 0 && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span className="truncate">{event.contact_names.join(', ')}</span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100">
                  {event.category && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500">Category:</span>
                      <p className="text-sm text-gray-700 mt-1">{event.category}</p>
                    </div>
                  )}
                  
                  {event.notes && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{event.notes}</p>
                    </div>
                  )}

                  {event.is_recurring && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        Recurring Event
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {event.source === 'circl' ? 'Created in Circl' : `Synced from ${event.source}`}
                    </span>
                    {event.created_at && (
                      <span className="text-xs text-gray-400">
                        Added {format(parseISO(event.created_at), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Events = () => {
  const { events, isLoading, error } = useEvents()
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [view, setView] = useState<'calendar' | 'grid'>('calendar')

  const handleEventToggle = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  // Transform events for calendar view
  const calendarData = events.map(event => ({
    day: parseISO(event.date),
    events: [{
      id: event.id,
      name: event.title,
      time: event.time || format(parseISO(event.date), 'HH:mm'),
      datetime: event.date,
      type: event.type,
      contact_names: event.contact_names
    }]
  }))

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading events</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">
            {events.length} {events.length === 1 ? 'event' : 'events'} in your timeline
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="rounded-md"
            >
              Calendar
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="rounded-md"
            >
              Grid
            </Button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden">
          <FullScreenCalendar 
            data={calendarData}
            onNewEvent={() => console.log('Add new event')}
            onEventClick={(event) => console.log('Event clicked:', event)}
          />
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first keystone or interaction.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            >
              <AnimatePresence>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isExpanded={expandedEventId === event.id}
                    onToggle={() => handleEventToggle(event.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default Events
