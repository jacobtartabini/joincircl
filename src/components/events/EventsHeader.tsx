
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

// Utility function for debouncing
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

interface EventsHeaderProps {
  onNewEvent: () => void
  filteredContactName?: string
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function EventsHeader({ onNewEvent, filteredContactName, searchQuery, onSearchChange }: EventsHeaderProps) {
  const isMobile = useIsMobile()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 200)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (isSearchExpanded && searchQuery) {
      onSearchChange('')
    }
  }

  return (
    <motion.div 
      className="border-b border-white/10 p-4 sm:p-6 bg-white/80 backdrop-blur-xl shadow-lg"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title Section */}
      <motion.div 
        className="flex items-center gap-4 mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar className="h-6 w-6 text-primary" />
        </motion.div>
        <div>
          <motion.h1 
            className="text-3xl font-bold text-foreground tracking-tight"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {filteredContactName ? `${filteredContactName}'s Events` : 'Events Calendar'}
          </motion.h1>
          <motion.p 
            className="text-sm text-muted-foreground/90"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {filteredContactName 
              ? `View all events for ${filteredContactName}`
              : 'Manage your keystones and track important moments'
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <motion.div 
          className="w-full lg:max-w-md"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search keystones, events, contacts..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-10 pr-4 rounded-full border-white/40 bg-white/60 backdrop-blur-sm focus-visible:ring-offset-0 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-300 hover:bg-white/70"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {searchQuery.length > 0 ? (
                    <motion.div
                      key="send"
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Send className="w-4 h-4 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ y: -20, opacity: 0, rotate: 90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* New Keystone Button */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button 
            onClick={onNewEvent}
            className={cn(
              "rounded-full px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90",
              "text-white border-0 backdrop-blur-sm gap-2",
              isMobile && "w-full mt-2"
            )}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-4 w-4" />
            </motion.div>
            New Keystone
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
