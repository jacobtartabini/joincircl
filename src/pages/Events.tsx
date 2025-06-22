
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { EventsHeader } from '@/components/events/EventsHeader'
import KeystoneForm from '@/components/keystone/KeystoneForm'
import { useEvents } from '@/hooks/useEvents'
import { useContacts } from '@/hooks/use-contacts'
import { useIsMobile } from '@/hooks/use-mobile'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { format, parseISO } from 'date-fns'

export default function Events() {
  const [searchParams] = useSearchParams()
  const contactId = searchParams.get('contact')
  const isMobile = useIsMobile()
  const [isKeystoneFormOpen, setIsKeystoneFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { events, isLoading, refetch } = useEvents({ contact_id: contactId || undefined })
  const { contacts } = useContacts()
  
  const filteredContact = contactId ? contacts.find(c => c.id === contactId) : undefined

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events
    
    const query = searchQuery.toLowerCase()
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.notes?.toLowerCase().includes(query) ||
      event.contact_names?.some(name => name.toLowerCase().includes(query))
    )
  }, [events, searchQuery])

  // Transform events for calendar component
  const calendarData = useMemo(() => {
    const eventsByDay = new Map()
    
    filteredEvents.forEach(event => {
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
  }, [filteredEvents])

  const handleNewKeystone = () => {
    setIsKeystoneFormOpen(true)
  }

  const handleKeystoneFormSuccess = () => {
    setIsKeystoneFormOpen(false)
    refetch()
  }

  const handleEventClick = (event: any) => {
    // TODO: Handle event click - show event details
    console.log('Event clicked:', event)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen glass-card-enhanced">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const keystoneFormContent = (
    <KeystoneForm 
      onSuccess={handleKeystoneFormSuccess}
      onCancel={() => setIsKeystoneFormOpen(false)}
      contact={filteredContact}
    />
  )

  return (
    <div className="min-h-screen glass-background">
      <div className="max-w-7xl mx-auto flex flex-col h-screen">
        <EventsHeader 
          onNewEvent={handleNewKeystone}
          filteredContactName={filteredContact?.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 overflow-hidden p-6 pt-0">
          <div className="h-full glass-card-enhanced rounded-3xl overflow-hidden border border-white/20">
            <FullScreenCalendar 
              data={calendarData}
              onNewEvent={handleNewKeystone}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </div>

      {/* Keystone Form Dialogs */}
      {isMobile ? (
        <Sheet open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6 glass-card-enhanced border-white/20">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/30" />
            <SheetHeader className="mb-4">
              <SheetTitle className="text-foreground">Create New Keystone</SheetTitle>
            </SheetHeader>
            {keystoneFormContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
          <DialogContent className="sm:max-w-xl glass-card-enhanced border-white/20">
            {keystoneFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
