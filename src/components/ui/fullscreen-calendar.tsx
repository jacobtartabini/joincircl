"use client"

import * as React from "react"
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

export function FullScreenCalendar({ data, onNewEvent, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
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
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-6 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none border-b border-white/10">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-2xl glass-card p-2 md:flex border border-white/20">
              <h1 className="text-xs uppercase text-muted-foreground font-medium">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-2 text-lg font-bold text-primary">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground/80">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="inline-flex -space-x-px rounded-2xl shadow-sm md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 glass-card border-white/30"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 md:w-auto glass-card border-white/30"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-2xl last:rounded-e-2xl focus-visible:z-10 glass-card border-white/30"
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

          <Button 
            onClick={onNewEvent}
            className="w-full gap-2 md:w-auto glass-card bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/90 text-white border-primary/30 rounded-2xl"
          >
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>New Keystone</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col flex-1">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Sun</div>
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Mon</div>
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Tue</div>
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Wed</div>
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Thu</div>
          <div className="border-r border-white/10 py-3 text-muted-foreground/80">Fri</div>
          <div className="py-3 text-muted-foreground/80">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto flex-1">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-accent/10 text-muted-foreground/60",
                  "relative flex flex-col border-b border-r border-white/10 hover:bg-white/5 focus:z-10 cursor-pointer transition-colors",
                  !isEqual(day, selectedDay) && "hover:bg-white/5",
                )}
              >
                <header className="flex items-center justify-between p-3">
                  <button
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
                        "border-none bg-primary",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary/80",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "flex h-8 w-8 items-center justify-center rounded-xl text-sm hover:bg-primary/20 transition-colors",
                    )}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </button>
                </header>
                <div className="flex-1 p-3 space-y-1">
                  {data
                    .filter((event) => isSameDay(event.day, day))
                    .map((dayData) => (
                      <div key={dayData.day.toString()} className="space-y-1">
                        {dayData.events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(event)
                            }}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-xl border p-2 text-xs leading-tight cursor-pointer hover:scale-[0.98] transition-all duration-200 backdrop-blur-sm",
                              eventTypeColors[event.type]
                            )}
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
                          </div>
                        ))}
                        {dayData.events.length > 3 && (
                          <div className="text-xs text-muted-foreground/70 px-1">
                            + {dayData.events.length - 3} more
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile calendar grid - keep existing code but update styling */}
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 lg:hidden">
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
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
                  "flex h-14 flex-col border-b border-r border-white/10 px-3 py-2 hover:bg-white/5 focus:z-10 transition-colors",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </time>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div>
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.slice(0, 3).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "mx-0.5 mt-1 h-1.5 w-1.5 rounded-full",
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
}
