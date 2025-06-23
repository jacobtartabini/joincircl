
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEvents } from '@/hooks/useEvents'
import { EventsHeader } from '@/components/events/EventsHeader'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { ExpandableEventCard } from '@/components/events/ExpandableEventCard'
import { EventFormModal } from '@/components/events/EventFormModal'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface EventsPageProps {
  filteredContactName?: string
}

export function EventsPage({ filteredContactName }: EventsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  const { events, isLoading } = useEvents({
    search: searchQuery,
    contact_id: filteredContactName ? undefined : undefined // We'll need to implement contact filtering
  })

  const handleNewEvent = () => {
    setIsNewEventModalOpen(true)
  }

  const handleEventClick = (eventId: string) => {
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
      contact_names: event.contact_names || []
    }]
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <EventsHeader
        onNewEvent={handleNewEvent}
        filteredContactName={filteredContactName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden"
            >
              <FullScreenCalendar
                data={calendarData}
                onNewEvent={handleNewEvent}
                onEventClick={(event) => console.log('Event clicked:', event)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {events.length === 0 ? (
                <Card className="text-center py-16 bg-white/60 backdrop-blur-sm border-white/40">
                  <CardContent>
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-3">No events found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchQuery
                        ? `No events match "${searchQuery}". Try adjusting your search.`
                        : 'Start tracking important moments by creating your first event.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                  layout
                >
                  <AnimatePresence>
                    {events.map((event) => (
                      <ExpandableEventCard
                        key={event.id}
                        event={event}
                        isExpanded={expandedEventId === event.id}
                        onToggle={() => handleEventClick(event.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EventFormModal
        isOpen={isNewEventModalOpen}
        onOpenChange={setIsNewEventModalOpen}
        onSuccess={() => {
          setIsNewEventModalOpen(false)
          // Refetch events would happen automatically with react-query
        }}
      />
    </div>
  )
}
