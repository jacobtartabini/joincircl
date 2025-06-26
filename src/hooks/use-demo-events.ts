
import { useLocation } from 'react-router-dom';
import { useFastDemoEvents } from './use-fast-demo-data';
import { useEvents as useRealEvents } from './useEvents';
import type { EventFilters } from '@/types/events';

export const useDemoEvents = (filters?: EventFilters) => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  if (isDemo) {
    // Use demo data
    const { data: events = [], isLoading, error, refetch } = useFastDemoEvents();
    
    // Apply filters to demo data
    const filteredEvents = filters ? events.filter(event => {
      if (filters.type && filters.type !== 'all' && event.type !== filters.type) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesNotes = event.notes?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesNotes) {
          return false;
        }
      }
      return true;
    }) : events;
    
    return {
      events: filteredEvents,
      allEvents: events,
      isLoading,
      error,
      refetch
    };
  } else {
    // Use real events hook for non-demo routes
    return useRealEvents(filters);
  }
};
