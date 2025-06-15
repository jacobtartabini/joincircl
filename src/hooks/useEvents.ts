
import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/services/eventsService'
import { UnifiedEvent, EventFilters } from '@/types/events'
import { useMemo } from 'react'

export const useEvents = (filters?: EventFilters) => {
  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', filters?.contact_id],
    queryFn: () => filters?.contact_id 
      ? eventsService.getEventsByContactId(filters.contact_id)
      : eventsService.getAllEvents(),
  })

  const filteredEvents = useMemo(() => {
    if (!filters) return events

    return events.filter(event => {
      // Type filter
      if (filters.type && filters.type !== 'all' && event.type !== filters.type) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = event.title.toLowerCase().includes(searchLower)
        const matchesNotes = event.notes?.toLowerCase().includes(searchLower)
        const matchesContact = event.contact_names?.some(name => 
          name.toLowerCase().includes(searchLower)
        )
        
        if (!matchesTitle && !matchesNotes && !matchesContact) {
          return false
        }
      }

      // Date range filter
      if (filters.date_from) {
        const eventDate = new Date(event.date)
        const fromDate = new Date(filters.date_from)
        if (eventDate < fromDate) return false
      }

      if (filters.date_to) {
        const eventDate = new Date(event.date)
        const toDate = new Date(filters.date_to)
        if (eventDate > toDate) return false
      }

      return true
    })
  }, [events, filters])

  return {
    events: filteredEvents,
    allEvents: events,
    isLoading,
    error,
    refetch
  }
}
