
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { EventsHeader } from '@/components/events/EventsHeader'
import { EventForm } from '@/components/events/EventForm'
import { useEvents } from '@/hooks/useEvents'
import { useContacts } from '@/hooks/use-contacts'
import { useIsMobile } from '@/hooks/use-mobile'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { format, parseISO, isSameDay } from 'date-fns'

export default function Events() {
  const [searchParams] = useSearchParams()
  const contactId = searchParams.get('contact')
  const isMobile = useIsMobile()
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  
  const { events, isLoading, refetch } = useEvents({ contact_id: contactId || undefined })
  const { contacts } = useContacts()
  
  const filteredContact = contactId ? contacts.find(c => c.id === contactId) : undefined

  // Transform events for calendar component
  const calendarData = useMemo(() => {
    const eventsByDay = new Map()
    
    events.forEach(event => {
      const dayKey = format(parseISO(event.date), 'yyyy-MM-dd')
      
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, {
          day: parseISO(event.date),
          events: []
        })
      }
      
      eventsByDay.get(dayKey).events.push({
        id: event.id,
        name: event.title,
        time: event.time || '00:00',
        datetime: event.date,
        type: event.type,
        contact_names: event.contact_names || []
      })
    })
    
    return Array.from(eventsByDay.values())
  }, [events])

  const handleNewEvent = () => {
    setIsEventFormOpen(true)
  }

  const handleEventFormSuccess = () => {
    setIsEventFormOpen(false)
    refetch()
  }

  const handleEventClick = (event: any) => {
    // TODO: Handle event click - show event details
    console.log('Event clicked:', event)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const eventFormContent = (
    <EventForm 
      onSuccess={handleEventFormSuccess}
      onCancel={() => setIsEventFormOpen(false)}
      preselectedContactId={contactId || undefined}
    />
  )

  return (
    <div className="min-h-screen refined-web-theme">
      <div className="max-w-7xl mx-auto flex flex-col h-screen">
        <EventsHeader 
          onNewEvent={handleNewEvent}
          filteredContactName={filteredContact?.name}
        />
        
        <div className="flex-1 overflow-hidden">
          <FullScreenCalendar 
            data={calendarData}
            onNewEvent={handleNewEvent}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event Form Dialogs */}
      {isMobile ? (
        <Sheet open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 glass-card-enhanced">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/30" />
            <SheetHeader className="mb-4">
              <SheetTitle className="text-foreground">Create Event</SheetTitle>
            </SheetHeader>
            {eventFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
          <DialogContent className="sm:max-w-xl glass-card-enhanced border-white/20 dark:border-white/15">
            {eventFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
