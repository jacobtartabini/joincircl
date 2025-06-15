
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

interface EventsHeaderProps {
  onNewEvent: () => void
  filteredContactName?: string
}

export function EventsHeader({ onNewEvent, filteredContactName }: EventsHeaderProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex-shrink-0 p-4 pb-2 bg-card border-b border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {filteredContactName ? `${filteredContactName}'s Events` : 'Events Calendar'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredContactName 
              ? `View all events for ${filteredContactName}`
              : 'View and manage all your events, keystones, and interactions'
            }
          </p>
        </div>
      </div>

      {isMobile && (
        <Button 
          onClick={onNewEvent}
          className="w-full bg-gradient-to-r from-[#0daeec]/90 to-[#0daeec]/70 hover:from-[#0daeec] hover:to-[#0daeec]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      )}
    </div>
  )
}
