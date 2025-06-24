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
  getDaysInMonth,
  startOfMonth,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  onNewEvent?: (date?: Date, time?: string) => void
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

export function FullCalendar({ data, onNewEvent, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [view, setView] = React.useState<'day' | 'week' | 'month' | 'year'>('month')
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

  const handleDoubleClick = (date: Date, time?: string) => {
    onNewEvent?.(date, time)
  }

  const renderDayView = () => {
    const dayEvents = data.find(d => isSameDay(d.day, selectedDay))?.events || []
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-white dark:bg-gray-900">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h2>
          </div>
          <div className="p-4 space-y-1">
            {hours.map(hour => {
              const hourEvents = dayEvents.filter(event => {
                const eventHour = parseInt(event.time?.split(':')[0] || '0')
                return eventHour === hour
              })
              
              return (
                <div 
                  key={hour}
                  className="flex border-b border-gray-100 dark:border-gray-800 min-h-16 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(selectedDay, `${hour.toString().padStart(2, '0')}:00`)}
                >
                  <div className="w-20 p-2 text-sm text-gray-500 flex-shrink-0">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 p-2 space-y-1">
                    {hourEvents.map(event => (
                      <motion.div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "p-2 rounded-md border cursor-pointer text-sm",
                          eventTypeColors[event.type]
                        )}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="font-medium">{event.name}</div>
                        <div className="text-xs opacity-75">{event.time}</div>
                        {event.contact_names && event.contact_names.length > 0 && (
                          <div className="text-xs opacity-75 mt-1">
                            {event.contact_names.join(', ')}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfCurrentWeek = startOfWeek(selectedDay)
    const weekDays = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: add(startOfCurrentWeek, { days: 6 })
    })
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-white dark:bg-gray-900">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 w-20"></div>
              {weekDays.map(day => (
                <div key={day.toString()} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                  <div className={cn(
                    "text-lg font-semibold mt-1",
                    isToday(day) && "text-blue-600 dark:text-blue-400"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-0">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-800 min-h-16">
                <div className="w-20 p-2 text-sm text-gray-500 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {weekDays.map(day => {
                  const dayEvents = data.find(d => isSameDay(d.day, day))?.events || []
                  const hourEvents = dayEvents.filter(event => {
                    const eventHour = parseInt(event.time?.split(':')[0] || '0')
                    return eventHour === hour
                  })
                  
                  return (
                    <div 
                      key={day.toString()}
                      className="border-l border-gray-200 dark:border-gray-700 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onDoubleClick={() => handleDoubleClick(day, `${hour.toString().padStart(2, '0')}:00`)}
                    >
                      {hourEvents.map(event => (
                        <motion.div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className={cn(
                            "p-1 rounded text-xs cursor-pointer mb-1 border",
                            eventTypeColors[event.type]
                          )}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="font-medium truncate">{event.name}</div>
                          <div className="opacity-75">{event.time}</div>
                        </motion.div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => (
    <div className="flex-1 overflow-auto">
      <div className="bg-white dark:bg-gray-900 h-full">
        {/* Desktop Month View */}
        <div className="hidden lg:block h-full">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="p-3 text-center text-sm font-semibold border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr" style={{ height: 'calc(100% - 60px)' }}>
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => handleDoubleClick(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-gray-50 dark:bg-gray-800/50 text-gray-400",
                  "relative flex flex-col border-b border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-32",
                  isEqual(day, selectedDay) && "bg-blue-50 dark:bg-blue-900/20",
                )}
              >
                <div className="p-2">
                  <div className={cn(
                    "text-sm font-medium",
                    isToday(day) && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center",
                    isEqual(day, selectedDay) && !isToday(day) && "text-blue-600 dark:text-blue-400"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex-1 p-2 space-y-1 overflow-hidden">
                  {data
                    .filter((event) => isSameDay(event.day, day))
                    .map((dayData) => (
                      <div key={dayData.day.toString()}>
                        {dayData.events.slice(0, 3).map((event) => (
                          <Popover key={event.id}>
                            <PopoverTrigger asChild>
                              <motion.div
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className={cn(
                                  "p-1 rounded text-xs cursor-pointer border",
                                  eventTypeColors[event.type]
                                )}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="font-medium truncate">{event.name}</div>
                                <div className="opacity-75">{event.time}</div>
                              </motion.div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-3">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{event.name}</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div>{format(day, 'PPP')} at {event.time}</div>
                                  <div className="mt-1">Type: {event.type}</div>
                                  {event.contact_names && event.contact_names.length > 0 && (
                                    <div className="mt-1">Contacts: {event.contact_names.join(', ')}</div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => onEventClick?.(event)}
                                  className="w-full"
                                >
                                  View Details
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                        {dayData.events.length > 3 && (
                          <div className="text-xs text-gray-500 px-1">
                            + {dayData.events.length - 3} more
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Month View */}
        <div className="lg:hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={day} className="p-2 text-center text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {days.map((day, dayIdx) => (
              <button
                key={dayIdx}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => handleDoubleClick(day)}
                className={cn(
                  "bg-white dark:bg-gray-900 p-2 h-16 text-sm relative",
                  !isSameMonth(day, firstDayCurrentMonth) && "text-gray-400 bg-gray-50 dark:bg-gray-800",
                  isEqual(day, selectedDay) && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                  isToday(day) && "bg-blue-600 text-white"
                )}
              >
                <div>{format(day, 'd')}</div>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .slice(0, 1)
                      .map((date) => (
                        <div key={date.day.toString()} className="flex space-x-1">
                          {date.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                event.type === 'keystone' && "bg-blue-500",
                                event.type === 'interaction' && "bg-green-500",
                                event.type === 'birthday' && "bg-pink-500",
                                event.type === 'sync' && "bg-purple-500",
                                event.type === 'calendar' && "bg-orange-500",
                              )}
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderYearView = () => {
    const currentYear = firstDayCurrentMonth.getFullYear()
    const months = eachMonthOfInterval({
      start: startOfYear(firstDayCurrentMonth),
      end: endOfYear(firstDayCurrentMonth)
    })

    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
          {months.map(month => {
            const monthDays = eachDayOfInterval({
              start: startOfWeek(startOfMonth(month)),
              end: endOfWeek(endOfMonth(month))
            })
            
            return (
              <div key={month.toString()} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-center mb-3">
                  {format(month, 'MMMM yyyy')}
                </h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-gray-500 font-medium p-1">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day, dayIdx) => {
                    const dayEvents = data.find(d => isSameDay(d.day, day))?.events || []
                    return (
                      <button
                        key={dayIdx}
                        onClick={() => setSelectedDay(day)}
                        onDoubleClick={() => handleDoubleClick(day)}
                        className={cn(
                          "p-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative",
                          !isSameMonth(day, month) && "text-gray-300 dark:text-gray-600",
                          isToday(day) && "bg-blue-600 text-white",
                          isEqual(day, selectedDay) && !isToday(day) && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {format(day, 'd')}
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  event.type === 'keystone' && "bg-blue-500",
                                  event.type === 'interaction' && "bg-green-500",
                                  event.type === 'birthday' && "bg-pink-500",
                                  event.type === 'sync' && "bg-purple-500",
                                  event.type === 'calendar' && "bg-orange-500",
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col space-y-4 p-6 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {view === 'year' ? format(firstDayCurrentMonth, "yyyy") : format(firstDayCurrentMonth, "MMMM yyyy")}
              </h2>
              {view === 'day' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
              {view === 'week' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Week of {format(startOfWeek(selectedDay), 'MMM d')}
                </p>
              )}
            </div>
          </div>
          
          {/* View Selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {['day', 'week', 'month', 'year'].map((v) => (
              <Button
                key={v}
                onClick={() => setView(v as any)}
                variant={view === v ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Button
              onClick={view === 'year' ? () => setCurrentMonth(format(add(firstDayCurrentMonth, { years: -1 }), "MMM-yyyy")) : previousMonth}
              variant="ghost"
              size="sm"
              className="rounded-none"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={goToToday}
              variant="ghost"
              size="sm"
              className="rounded-none px-4"
            >
              Today
            </Button>
            <Button
              onClick={view === 'year' ? () => setCurrentMonth(format(add(firstDayCurrentMonth, { years: 1 }), "MMM-yyyy")) : nextMonth}
              variant="ghost"
              size="sm"
              className="rounded-none"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={() => onNewEvent?.()}
            className="gap-2"
            size="sm"
          >
            <PlusCircleIcon className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
        {view === 'year' && renderYearView()}
      </div>
    </div>
  )
}
