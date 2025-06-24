
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

interface Event {
  id: string
  name: string
  time: string
  datetime: string
  type: 'keystone' | 'interaction' | 'birthday' | 'sync' | 'calendar'
  contact_names?: string[]
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onNewEvent?: () => void
  onNewEventWithData?: (data: { date?: string; time?: string; endDate?: string; endTime?: string }) => void
  onEventClick?: (event: Event) => void
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

const eventTypeColors = {
  keystone: "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300",
  interaction: "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-300",
  birthday: "bg-pink-500/20 border-pink-500/30 text-pink-700 dark:text-pink-300",
  sync: "bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300",
  calendar: "bg-orange-500/20 border-orange-500/30 text-orange-700 dark:text-orange-300",
}

export function FullScreenCalendar({ data, onNewEvent, onNewEventWithData, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState<Date | null>(null)
  const [dragEnd, setDragEnd] = React.useState<Date | null>(null)
  const [dragStartTime, setDragStartTime] = React.useState<string | null>(null)
  const [dragEndTime, setDragEndTime] = React.useState<string | null>(null)

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isMobile = useIsMobile()

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  // Handle double-click on day
  const handleDayDoubleClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const timeStr = format(new Date(), 'HH:mm')
    
    if (onNewEventWithData) {
      onNewEventWithData({
        date: dateStr,
        time: timeStr
      })
    } else {
      onNewEvent?.()
    }
  }

  // Handle mouse down for drag start
  const handleMouseDown = (day: Date, event: React.MouseEvent) => {
    if (event.detail === 2) return // Ignore if it's a double-click
    
    setIsDragging(true)
    setDragStart(day)
    setDragEnd(day)
  }

  // Handle mouse move for drag
  const handleMouseMove = (day: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(day)
    }
  }

  // Handle mouse up for drag end
  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onNewEventWithData) {
      const startDate = dragStart <= dragEnd ? dragStart : dragEnd
      const endDate = dragStart <= dragEnd ? dragEnd : dragStart
      
      onNewEventWithData({
        date: format(startDate, 'yyyy-MM-dd'),
        time: '09:00', // Default start time
        endDate: format(endDate, 'yyyy-MM-dd'),
        endTime: '10:00' // Default end time
      })
    }
    
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // Check if day is in drag selection
  const isDayInDragSelection = (day: Date) => {
    if (!isDragging || !dragStart || !dragEnd) return false
    
    const startDate = dragStart <= dragEnd ? dragStart : dragEnd
    const endDate = dragStart <= dragEnd ? dragEnd : dragStart
    
    return day >= startDate && day <= endDate
  }

  // Add global mouse up listener to handle drag end even when mouse leaves component
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, dragStart, dragEnd])

  return (
    <div className="flex flex-1 flex-col w-full min-h-0">
      {/* Calendar Header */}
      <motion.div 
        className="flex flex-col space-y-4 p-6 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none border-b border-white/10 bg-white/5 backdrop-blur-sm"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <motion.div 
              className="hidden w-20 flex-col items-center justify-center rounded-2xl p-2 md:flex border border-white/30 bg-white/10 backdrop-blur-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xs uppercase text-muted-foreground font-medium">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-xl bg-primary/20 border border-primary/30 p-2 text-lg font-bold text-primary">
                <span>{format(today, "d")}</span>
              </div>
            </motion.div>
            <div className="flex flex-col">
              <motion.h2 
                className="text-xl font-semibold text-foreground"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </motion.h2>
              <motion.p 
                className="text-sm text-muted-foreground/80"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </motion.p>
            </div>
          </div>
        </div>

        <motion.div 
          className="flex flex-col items-center gap-4 md:flex-row md:gap-6"
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="inline-flex -space-x-px rounded-2xl shadow-lg md:w-auto rtl:space-x-reverse overflow-hidden">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 md:w-auto bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block opacity-30" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden opacity-30"
          />

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onNewEvent}
              className="w-full gap-2 md:w-auto bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
              <span>New Keystone</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Calendar Grid - Made fully responsive */}
      <div className="flex flex-col flex-1 w-full overflow-visible">
        {/* Week Days Header */}
        <motion.div 
          className="grid grid-cols-7 border-b border-white/10 text-center text-xs font-semibold leading-6 bg-white/5 shrink-0"
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <motion.div 
              key={day}
              className="border-r border-white/10 py-3 text-muted-foreground/80 last:border-r-0"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </motion.div>

        {/* Calendar Days - Desktop */}
        <div className="hidden lg:block flex-1 w-full">
          <motion.div 
            className="grid grid-cols-7 auto-rows-fr min-h-0"
            style={{ minHeight: 'calc(100vh - 300px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {days.map((day, dayIdx) => (
              <motion.div
                key={dayIdx}
                onDoubleClick={() => handleDayDoubleClick(day)}
                onMouseDown={(e) => handleMouseDown(day, e)}
                onMouseMove={() => handleMouseMove(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-accent/10 text-muted-foreground/60",
                  "relative flex flex-col border-b border-r border-white/10 hover:bg-white/10 focus:z-10 cursor-pointer transition-all duration-300 min-h-32",
                  !isEqual(day, selectedDay) && "hover:bg-white/10",
                  isDayInDragSelection(day) && "bg-primary/20 border-primary/40",
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + dayIdx * 0.02 }}
                whileHover={{ scale: 1.02 }}
              >
                <header className="flex items-center justify-between p-3">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground/60",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "border-none bg-primary shadow-lg",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary/80 shadow-md",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "flex h-8 w-8 items-center justify-center rounded-xl text-sm hover:bg-primary/30 transition-all duration-200 backdrop-blur-sm",
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </motion.button>
                </header>
                <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                  <AnimatePresence>
                    {data
                      .filter((event) => isSameDay(event.day, day))
                      .map((dayData) => (
                        <div key={dayData.day.toString()} className="space-y-1">
                          {dayData.events.slice(0, 3).map((event, eventIndex) => (
                            <motion.div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                onEventClick?.(event)
                              }}
                              className={cn(
                                "flex flex-col items-start gap-1 rounded-xl border p-2 text-xs leading-tight cursor-pointer transition-all duration-200 backdrop-blur-sm hover:shadow-md",
                                eventTypeColors[event.type]
                              )}
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.9 }}
                              transition={{ duration: 0.2, delay: eventIndex * 0.05 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <p className="font-medium leading-none truncate w-full">
                                {event.name}
                              </p>
                              <p className="leading-none text-muted-foreground/80 text-xs">
                                {event.time}
                              </p>
                              {event.contact_names && event.contact_names.length > 0 && (
                                <p className="leading-none text-xs opacity-75 truncate w-full">
                                  {event.contact_names.join(", ")}
                                </p>
                              )}
                            </motion.div>
                          ))}
                          {dayData.events.length > 3 && (
                            <motion.div 
                              className="text-xs text-muted-foreground/70 px-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              + {dayData.events.length - 3} more
                            </motion.div>
                          )}
                        </div>
                      ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile calendar grid */}
        <motion.div 
          className="lg:hidden grid grid-cols-7 auto-rows-fr gap-0"
          style={{ minHeight: 'calc(100vh - 300px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {days.map((day, dayIdx) => (
            <motion.button
              onClick={() => setSelectedDay(day)}
              onDoubleClick={() => handleDayDoubleClick(day)}
              key={dayIdx}
              type="button"
              className={cn(
                isEqual(day, selectedDay) && "text-primary-foreground",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  isSameMonth(day, firstDayCurrentMonth) &&
                  "text-foreground",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  !isSameMonth(day, firstDayCurrentMonth) &&
                  "text-muted-foreground/60",
                (isEqual(day, selectedDay) || isToday(day)) &&
                  "font-semibold",
                "flex flex-col border-b border-r border-white/10 px-3 py-2 hover:bg-white/10 focus:z-10 transition-all duration-200 min-h-20",
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + dayIdx * 0.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={cn(
                  "ml-auto flex size-6 items-center justify-center rounded-full transition-all duration-200 text-sm",
                  isEqual(day, selectedDay) &&
                    isToday(day) &&
                    "bg-primary text-primary-foreground shadow-lg",
                  isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    "bg-primary text-primary-foreground shadow-md",
                )}
              >
                {format(day, "d")}
              </time>
              {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                <div className="flex-1 flex items-end">
                  {data
                    .filter((date) => isSameDay(date.day, day))
                    .map((date) => (
                      <div
                        key={date.day.toString()}
                        className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                      >
                        {date.events.slice(0, 3).map((event) => (
                          <motion.span
                            key={event.id}
                            className={cn(
                              "mx-0.5 mt-1 h-1.5 w-1.5 rounded-full",
                              event.type === 'keystone' && "bg-blue-500",
                              event.type === 'interaction' && "bg-green-500",
                              event.type === 'birthday' && "bg-pink-500",
                              event.type === 'sync' && "bg-purple-500",
                              event.type === 'calendar' && "bg-orange-500",
                            )}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
