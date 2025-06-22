
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </motion.div>
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
    <motion.div 
      className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <EventsHeader 
          onNewEvent={handleNewKeystone}
          filteredContactName={filteredContact?.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </motion.div>
        
      {/* Content */}
      <motion.div 
        className="flex-1 p-4 sm:p-6 overflow-hidden min-h-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="h-full rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl"
          whileHover={{ scale: 1.001 }}
          transition={{ duration: 0.2 }}
        >
          <FullScreenCalendar 
            data={calendarData}
            onNewEvent={handleNewKeystone}
            onEventClick={handleEventClick}
          />
        </motion.div>
      </motion.div>

      {/* Keystone Form Dialogs */}
      <AnimatePresence>
        {isMobile ? (
          <Sheet open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
            <SheetContent 
              side="bottom" 
              className="h-[90vh] overflow-auto pt-6 bg-white/95 backdrop-blur-xl border-white/30"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/40" />
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-foreground">Create New Keystone</SheetTitle>
                </SheetHeader>
                {keystoneFormContent}
              </motion.div>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
            <DialogContent className="sm:max-w-xl bg-white/95 backdrop-blur-xl border-white/30 rounded-2xl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {keystoneFormContent}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
