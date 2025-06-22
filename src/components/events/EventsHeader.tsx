
import { Calendar, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassInput } from '@/components/ui/GlassInput'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface EventsHeaderProps {
  onNewEvent: () => void
  filteredContactName?: string
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function EventsHeader({ onNewEvent, filteredContactName, searchQuery, onSearchChange }: EventsHeaderProps) {
  const isMobile = useIsMobile()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (isSearchExpanded && searchQuery) {
      onSearchChange('')
    }
  }

  return (
    <div className="flex-shrink-0 p-6 glass-card-enhanced border-b border-white/10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center glass-card border border-primary/20">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {filteredContactName ? `${filteredContactName}'s Events` : 'Events Calendar'}
          </h1>
          <p className="text-sm text-muted-foreground/80">
            {filteredContactName 
              ? `View all events for ${filteredContactName}`
              : 'View and manage all your keystones and interactions'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search functionality */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSearch}
            className={cn(
              "glass-card border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300",
              isSearchExpanded && "bg-white/20"
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <div className={cn(
            "transition-all duration-300 ease-out overflow-hidden",
            isSearchExpanded ? "w-full opacity-100" : "w-0 opacity-0"
          )}>
            <GlassInput
              placeholder="Search keystones and interactions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* New Keystone button */}
        {!isMobile && (
          <Button 
            onClick={onNewEvent}
            className="glass-card bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90 text-white border-primary/30 backdrop-blur-sm shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Keystone
          </Button>
        )}
      </div>

      {isMobile && (
        <Button 
          onClick={onNewEvent}
          className="w-full mt-4 glass-card bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90 text-white border-primary/30 backdrop-blur-sm shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Keystone
        </Button>
      )}
    </div>
  )
}
