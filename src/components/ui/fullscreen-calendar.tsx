
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
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  addHours,
  isSameHour,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn,
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
  onNewEvent?: (date?: Date, startTime?: Date, endTime?: Date) => void
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

type CalendarView = 'day' | 'week' | 'month' | 'year'

interface SelectionState {
  isSelecting: boolean
  startDate?: Date
  endDate?: Date
  startTime?: Date
  endTime?: Date
}

export function FullScreenCalendar({ data, onNewEvent, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [view, setView] = React.useState<CalendarView>('month')
  const [selection, setSelection] = React.useState<SelectionState>({ isSelecting: false })
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isMobile = useIsMobile()

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  const hours = eachHourOfInterval({
    start: startOfDay(selectedDay),
    end: endOfDay(selectedDay),
  })

  const weekDays = eachDayOfInterval({
    start: startOfWeekFn(selectedDay),
    end: endOfWeekFn(selectedDay),
  })

  const yearMonths = eachMonthOfInterval({
    start: startOfYear(firstDayCurrentMonth),
    end: endOfYear(firstDayCurrentMonth),
  })

  function previousPeriod() {
    const firstDay = view === 'year' 
      ? add(firstDayCurrentMonth, { years: -1 })
      : view === 'day' || view === 'week'
      ? add(selectedDay, view === 'day' ? { days: -1 } : { weeks: -1 })
      : add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDay, "MMM-yyyy"))
    if (view === 'day' || view === 'week') {
      setSelectedDay(firstDay)
    }
  }

  function nextPeriod() {
    const firstDay = view === 'year' 
      ? add(firstDayCurrentMonth, { years: 1 })
      : view === 'day' || view === 'week'
      ? add(selectedDay, view === 'day' ? { days: 1 } : { weeks: 1 })
      : add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDay, "MMM-yyyy"))
    if (view === 'day' || view === 'week') {
      setSelectedDay(firstDay)
    }
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  const handleDoubleClick = (date: Date, time?: Date) => {
    const eventDate = time || date
    onNewEvent?.(eventDate, eventDate, time ? addHours(eventDate, 1) : undefined)
  }

  const handleMouseDown = (date: Date, time?: Date) => {
    setSelection({
      isSelecting: true,
      startDate: date,
      endDate: date,
      startTime: time,
      endTime: time ? addHours(time, 1) : undefined,
    })
  }

  const handleMouseEnter = (date: Date, time?: Date) => {
    if (selection.isSelecting) {
      setSelection(prev => ({
        ...prev,
        endDate: date,
        endTime: time ? addHours(time, 1) : undefined,
      }))
    }
  }

  const handleMouseUp = () => {
    if (selection.isSelecting && selection.startDate) {
      const startDate = selection.startDate < (selection.endDate || selection.startDate) 
        ? selection.startDate 
        : selection.endDate || selection.startDate
      const endDate = selection.startDate < (selection.endDate || selection.startDate) 
        ? selection.endDate || selection.startDate 
        : selection.startDate
      
      onNewEvent?.(startDate, selection.startTime, selection.endTime)
    }
    setSelection({ isSelecting: false })
  }

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selection.isSelecting) {
        handleMouseUp()
      }
    }
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [selection.isSelecting])

  const isDateInSelection = (date: Date, time?: Date) => {
    if (!selection.isSelecting || !selection.startDate) return false
    
    const checkDate = time || date
    const start = selection.startTime || selection.startDate
    const end = selection.endTime || selection.endDate || selection.startDate
    
    const actualStart = start < end ? start : end
    const actualEnd = start < end ? end : start
    
    return checkDate >= actualStart && checkDate <= actualEnd
  }

  const renderDayView = () => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-center mb-4">
        {format(selectedDay, 'EEEE, MMMM d, yyyy')}
      </h3>
      <div className="space-y-1">
        {hours.map((hour) => (
          <motion.div
            key={hour.toString()}
            className={cn(
              "flex items-center p-3 border border-white/10 rounded-lg cursor-pointer transition-all duration-200",
              "hover:bg-white/10",
              isDateInSelection(selectedDay, hour) && "bg-primary/20 border-primary/40"
            )}
            onDoubleClick={() => handleDoubleClick(selectedDay, hour)}
            onMouseDown={() => handleMouseDown(selectedDay, hour)}
            onMouseEnter={() => handleMouseEnter(selectedDay, hour)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: hour.getHours() * 0.02 }}
          >
            <div className="w-16 text-sm text-muted-foreground font-medium">
              {format(hour, 'HH:mm')}
            </div>
            <div className="flex-1 ml-4">
              {data
                .filter((event) => isSameDay(event.day, selectedDay))
                .map((dayData) => (
                  <div key={dayData.day.toString()}>
                    {dayData.events
                      .filter((event) => isSameHour(new Date(event.datetime), hour))
                      .map((event) => (
                        <motion.div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick?.(event)
                          }}
                          className={cn(
                            "p-2 rounded-lg border cursor-pointer mb-1",
                            eventTypeColors[event.type]
                          )}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="font-medium text-sm">{event.name}</p>
                          <p className="text-xs opacity-75">{event.time}</p>
                        </motion.div>
                      ))}
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-4">
        Week of {format(startOfWeekFn(selectedDay), 'MMMM d, yyyy')}
      </h3>
      <div className="grid grid-cols-8 gap-2">
        <div className="w-16"></div>
        {weekDays.map((day) => (
          <div key={day.toString()} className="text-center p-2 border-b border-white/10">
            <div className="text-sm font-medium">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-lg",
              isSameDay(day, today) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour.toString()} className="grid grid-cols-8 gap-2">
            <div className="w-16 text-sm text-muted-foreground font-medium py-3">
              {format(hour, 'HH:mm')}
            </div>
            {weekDays.map((day) => (
              <motion.div
                key={`${day.toString()}-${hour.toString()}`}
                className={cn(
                  "p-2 border border-white/10 rounded cursor-pointer transition-all duration-200 min-h-[3rem]",
                  "hover:bg-white/10",
                  isDateInSelection(day, hour) && "bg-primary/20 border-primary/40"
                )}
                onDoubleClick={() => handleDoubleClick(day, hour)}
                onMouseDown={() => handleMouseDown(day, hour)}
                onMouseEnter={() => handleMouseEnter(day, hour)}
              >
                {data
                  .filter((event) => isSameDay(event.day, day))
                  .map((dayData) => (
                    <div key={dayData.day.toString()}>
                      {dayData.events
                        .filter((event) => isSameHour(new Date(event.datetime), hour))
                        .slice(0, 1)
                        .map((event) => (
                          <motion.div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(event)
                            }}
                            className={cn(
                              "p-1 rounded text-xs cursor-pointer",
                              eventTypeColors[event.type]
                            )}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="font-medium truncate">{event.name}</p>
                          </motion.div>
                        ))}
                    </div>
                  ))}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  const renderMonthView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-7 border-b border-white/10 text-center text-sm font-semibold leading-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <motion.div 
            key={day}
            className="py-3 text-muted-foreground/80"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {day}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => (
          <motion.div
            key={dayIdx}
            onClick={() => setSelectedDay(day)}
            onDoubleClick={() => handleDoubleClick(day)}
            onMouseDown={() => handleMouseDown(day)}
            onMouseEnter={() => handleMouseEnter(day)}
            className={cn(
              dayIdx === 0 && colStartClasses[getDay(day)],
              !isEqual(day, selectedDay) &&
                !isToday(day) &&
                !isSameMonth(day, firstDayCurrentMonth) &&
                "bg-accent/10 text-muted-foreground/60",
              "relative flex flex-col border border-white/10 hover:bg-white/10 focus:z-10 cursor-pointer transition-all duration-300 min-h-[120px] p-2",
              !isEqual(day, selectedDay) && "hover:bg-white/10",
              isDateInSelection(day) && "bg-primary/20 border-primary/40"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: dayIdx * 0.02 }}
            whileHover={{ scale: 1.02 }}
          >
            <header className="flex items-center justify-between mb-2">
              <motion.button
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
            <div className="flex-1 space-y-1">
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
      </div>
    </div>
  )

  const renderYearView = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center mb-6">
        {format(firstDayCurrentMonth, 'yyyy')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {yearMonths.map((month) => {
          const monthDays = eachDayOfInterval({
            start: startOfWeek(startOfMonth(month)),
            end: endOfWeek(endOfMonth(month)),
          })
          
          return (
            <motion.div
              key={month.toString()}
              className="border border-white/20 rounded-lg p-4 bg-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: month.getMonth() * 0.05 }}
            >
              <h4 className="text-sm font-semibold text-center mb-3">
                {format(month, 'MMMM')}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-center text-muted-foreground font-medium py-1">
                    {day}
                  </div>
                ))}
                {monthDays.map((day, dayIdx) => (
                  <motion.div
                    key={dayIdx}
                    className={cn(
                      "text-center p-1 rounded cursor-pointer transition-all duration-200 min-h-[2rem] flex items-center justify-center",
                      !isSameMonth(day, month) && "text-muted-foreground/40",
                      isSameDay(day, today) && "bg-primary text-primary-foreground font-semibold",
                      "hover:bg-white/20",
                      isDateInSelection(day) && "bg-primary/30 border border-primary/50"
                    )}
                    onDoubleClick={() => handleDoubleClick(day)}
                    onMouseDown={() => handleMouseDown(day)}
                    onMouseEnter={() => handleMouseEnter(day)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {format(day, 'd')}
                    {data.some((event) => isSameDay(event.day, day)) && (
                      <div className="w-1 h-1 bg-primary rounded-full ml-1" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  const renderCurrentView = () => {
    switch (view) {
      case 'day':
        return renderDayView()
      case 'week':
        return renderWeekView()
      case 'month':
        return renderMonthView()
      case 'year':
        return renderYearView()
      default:
        return renderMonthView()
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
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
                {view === 'year' 
                  ? format(firstDayCurrentMonth, "yyyy")
                  : view === 'day'
                  ? format(selectedDay, "MMMM d, yyyy")
                  : view === 'week'
                  ? `Week of ${format(startOfWeekFn(selectedDay), "MMM d, yyyy")}`
                  : format(firstDayCurrentMonth, "MMMM, yyyy")
                }
              </motion.h2>
              <motion.p 
                className="text-sm text-muted-foreground/80"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {view === 'year' 
                  ? "Select a month to view details"
                  : view === 'day'
                  ? "Hourly view"
                  : view === 'week'
                  ? "7-day view"
                  : `${format(firstDayCurrentMonth, "MMM d, yyyy")} - ${format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}`
                }
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
          {/* View Toggle Buttons */}
          <div className="inline-flex rounded-2xl shadow-lg overflow-hidden">
            {(['day', 'week', 'month', 'year'] as CalendarView[]).map((viewType) => (
              <Button
                key={viewType}
                onClick={() => setView(viewType)}
                className={cn(
                  "rounded-none shadow-none px-3 py-2 text-xs font-medium transition-all duration-200",
                  view === viewType 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20"
                )}
                variant={view === viewType ? "default" : "outline"}
                size="sm"
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>

          <div className="inline-flex -space-x-px rounded-2xl shadow-lg md:w-auto rtl:space-x-reverse overflow-hidden">
            <Button
              onClick={previousPeriod}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous period"
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
              onClick={nextPeriod}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 bg-white/10 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              variant="outline"
              size="icon"
              aria-label="Navigate to next period"
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
              onClick={() => onNewEvent?.()}
              className="w-full gap-2 md:w-auto bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
              <span>New Keystone</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Calendar Content - Now with page-level scrolling */}
      <div className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  )
}
