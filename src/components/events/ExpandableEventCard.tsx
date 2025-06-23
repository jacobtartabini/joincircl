
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, User, MapPin, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { UnifiedEvent } from '@/types/events'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface ExpandableEventCardProps {
  event: UnifiedEvent
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const eventTypeColors = {
  keystone: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
  interaction: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300',
  birthday: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300',
  sync: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
  calendar: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
}

const eventTypeIcons = {
  keystone: Calendar,
  interaction: User,
  birthday: Calendar,
  sync: Clock,
  calendar: Calendar,
}

export function ExpandableEventCard({ 
  event, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete 
}: ExpandableEventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy')
  }

  const formatTime = (dateString: string) => {
    return event.time || format(parseISO(dateString), 'h:mm a')
  }

  const TypeIcon = eventTypeIcons[event.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md",
          isExpanded && "ring-2 ring-primary/30",
          isHovered && "shadow-lg transform scale-[1.02]"
        )}
        onClick={onToggle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base font-semibold truncate">
                {event.title}
              </CardTitle>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", eventTypeColors[event.type])}
            >
              {event.type}
            </Badge>
            {event.source && (
              <Badge variant="outline" className="text-xs">
                {event.source}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTime(event.date)}</span>
            </div>

            {event.contact_names && event.contact_names.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate">
                  {event.contact_names.slice(0, 2).join(', ')}
                  {event.contact_names.length > 2 && ` +${event.contact_names.length - 2} more`}
                </span>
              </div>
            )}
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  {/* Notes */}
                  {event.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                    </div>
                  )}

                  {/* Category */}
                  {event.category && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Category</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  )}

                  {/* Recurring Info */}
                  {event.is_recurring && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Recurring</h4>
                      <Badge variant="secondary" className="text-xs">
                        Yes
                      </Badge>
                    </div>
                  )}

                  {/* All Contacts */}
                  {event.contact_names && event.contact_names.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Contacts</h4>
                      <div className="flex flex-wrap gap-1">
                        {event.contact_names.map((name, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit()
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete()
                        }}
                        className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
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
