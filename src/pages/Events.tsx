
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  addWeeks,
  subWeeks,
  startOfMonth,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
  CalendarIcon,
  GridIcon,
  ListIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  Send,
  Search,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PopoverClose } from "@radix-ui/react-popover";
import { useEvents } from '@/hooks/useEvents';
import { useSearchParams } from 'react-router-dom';
import { useContacts } from '@/hooks/use-contacts';
import KeystoneForm from '@/components/keystone/KeystoneForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

// Utility function
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Types
interface Keystone {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location?: string;
  attendees?: string[];
  type: "meeting" | "event" | "deadline" | "milestone";
  color: string;
}

interface SearchResult {
  keystones: Keystone[];
  interactions: any[];
  contacts: any[];
}

type CalendarView = "month" | "week" | "day" | "year";
type LayoutView = "calendar" | "grid";

// Search Component
function KeystoneSearchBar() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const { events } = useEvents();

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      const keystones = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.notes || '',
        date: new Date(event.date),
        time: event.time || '9:00 AM',
        location: '',
        attendees: event.contact_names || [],
        type: 'event' as const,
        color: '#3b82f6'
      }));
      setResult({ keystones, interactions: [], contacts: [] });
      return;
    }

    setIsLoading(true);
    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredKeystones = events
      .filter((event) => {
        const searchableText = `${event.title} ${event.notes || ""} ${event.contact_names?.join(" ") || ""}`.toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.notes || '',
        date: new Date(event.date),
        time: event.time || '9:00 AM',
        location: '',
        attendees: event.contact_names || [],
        type: 'event' as const,
        color: '#3b82f6'
      }));

    setTimeout(() => {
      setResult({ keystones: filteredKeystones, interactions: [], contacts: [] });
      setIsLoading(false);
    }, 300);
  }, [debouncedQuery, isFocused, events]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search keystones, events, contacts..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-10 pr-4 rounded-full border-input focus-visible:ring-offset-0 focus-visible:ring-primary"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="popLayout">
              {query.length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isFocused && result && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {isLoading ? (
                <div className="p-3">
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ) : (
                <motion.ul className="max-h-60 overflow-y-auto">
                  {result.keystones.map((keystone) => (
                    <motion.li
                      key={keystone.id}
                      className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors duration-200"
                      variants={item}
                      layout
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: keystone.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{keystone.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(keystone.date, "MMM d, yyyy")} at {keystone.time}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                  {result.keystones.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No keystones found
                    </li>
                  )}
                </motion.ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Calendar View Selector
function CalendarViewSelector({
  view,
  onViewChange,
}: {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}) {
  const views: { value: CalendarView; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  return (
    <div className="flex rounded-full border border-border overflow-hidden">
      {views.map((viewOption) => (
        <Button
          key={viewOption.value}
          variant={view === viewOption.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(viewOption.value)}
          className={cn(
            "rounded-none px-4 py-2 text-sm transition-colors duration-200",
            view === viewOption.value ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {viewOption.label}
        </Button>
      ))}
    </div>
  );
}

// Layout View Selector
function LayoutViewSelector({
  layout,
  onLayoutChange,
}: {
  layout: LayoutView;
  onLayoutChange: (layout: LayoutView) => void;
}) {
  const layouts: { value: LayoutView; label: string; icon: React.ReactNode }[] = [
    { value: "calendar", label: "Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
    { value: "grid", label: "Grid", icon: <GridIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex rounded-full border border-border overflow-hidden">
      {layouts.map((layoutOption) => (
        <Button
          key={layoutOption.value}
          variant={layout === layoutOption.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onLayoutChange(layoutOption.value)}
          className={cn(
            "rounded-none px-4 py-2 text-sm transition-colors duration-200 gap-2",
            layout === layoutOption.value ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {layoutOption.icon}
          {layoutOption.label}
        </Button>
      ))}
    </div>
  );
}

// Keystone Detail Dialog
function KeystoneDetailDialog({
  keystone,
  open,
  onOpenChange,
}: {
  keystone: Keystone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!keystone) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: keystone.color }}
            />
            {keystone.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {keystone.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <span>{format(keystone.date, "EEEE, MMMM d, yyyy")} at {keystone.time}</span>
          </div>
          {keystone.location && (
            <div className="flex items-center gap-3 text-sm text-foreground">
              <MapPinIcon className="w-4 h-4 text-muted-foreground" />
              <span>{keystone.location}</span>
            </div>
          )}
          {keystone.attendees && keystone.attendees.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-foreground">
              <UsersIcon className="w-4 h-4 text-muted-foreground" />
              <span>{keystone.attendees.join(", ")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Calendar Grid Component
function CalendarGrid({
  keystones,
  onKeystoneClick,
  onDayDoubleClick,
  view,
}: {
  keystones: Keystone[];
  onKeystoneClick: (keystone: Keystone) => void;
  onDayDoubleClick: (date: Date) => void;
  view: CalendarView;
}) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"));
    setSelectedDay(today);
  }

  // Day View Component
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayKeystones = keystones.filter((keystone) =>
      isSameDay(keystone.date, selectedDay)
    );

    return (
      <div className="flex flex-1 flex-col rounded-xl border border-border overflow-hidden shadow-sm max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
          <h2 className="text-xl font-semibold text-card-foreground">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setSelectedDay(add(selectedDay, { days: -1 }))} variant="outline" size="icon" className="rounded-full">
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm" className="rounded-full px-4">
              Today
            </Button>
            <Button onClick={() => setSelectedDay(add(selectedDay, { days: 1 }))} variant="outline" size="icon" className="rounded-full">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <div className="grid grid-cols-[80px_1fr] bg-background min-h-full">
            {hours.map((hour) => {
              const hourKeystones = dayKeystones.filter((keystone) => {
                const keystoneHour = parseInt(keystone.time.split(':')[0]);
                const isPM = keystone.time.includes('PM');
                const hour24 = isPM && keystoneHour !== 12 ? keystoneHour + 12 : (!isPM && keystoneHour === 12 ? 0 : keystoneHour);
                return hour24 === hour;
              });

              return (
                <React.Fragment key={hour}>
                  <div className="p-3 text-sm text-muted-foreground border-r border-b border-border bg-secondary/20">
                    {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                  </div>
                  <div 
                    className="min-h-[60px] p-2 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                    onDoubleClick={() => onDayDoubleClick(selectedDay)}
                  >
                    {hourKeystones.map((keystone) => (
                      <div
                        key={keystone.id}
                        className="text-xs p-2 rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-1"
                        style={{ backgroundColor: keystone.color + "20", color: keystone.color }}
                        onClick={() => onKeystoneClick(keystone)}
                      >
                        <div className="font-medium">{keystone.title}</div>
                        <div className="text-xs opacity-75">{keystone.time}</div>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const startOfCurrentWeek = startOfWeek(selectedDay);
    const weekDays = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: add(startOfCurrentWeek, { days: 6 }),
    });

    return (
      <div className="flex flex-1 flex-col rounded-xl border border-border overflow-hidden shadow-sm max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
          <h2 className="text-xl font-semibold text-card-foreground">
            {format(startOfCurrentWeek, "MMM d")} - {format(add(startOfCurrentWeek, { days: 6 }), "MMM d, yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setSelectedDay(subWeeks(selectedDay, 1))} variant="outline" size="icon" className="rounded-full">
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm" className="rounded-full px-4">
              Today
            </Button>
            <Button onClick={() => setSelectedDay(addWeeks(selectedDay, 1))} variant="outline" size="icon" className="rounded-full">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-border text-center text-sm font-medium text-muted-foreground bg-secondary/20">
          {weekDays.map((day) => (
            <div key={day.toString()} className="py-3">
              <div className="font-semibold">{format(day, "EEE")}</div>
              <div className={cn("text-lg", isToday(day) && "text-primary font-bold")}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-background overflow-auto min-h-0">
          {weekDays.map((day) => {
            const dayKeystones = keystones.filter((keystone) =>
              isSameDay(keystone.date, day)
            );

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[400px] border-r border-border p-3 flex flex-col",
                  isEqual(day, selectedDay) && "bg-accent/50",
                  isToday(day) && "bg-primary/10",
                  "hover:bg-accent/70 transition-colors duration-200 cursor-pointer"
                )}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => onDayDoubleClick(day)}
              >
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayKeystones.map((keystone) => (
                    <div
                      key={keystone.id}
                      className="text-xs p-1.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 truncate"
                      style={{ backgroundColor: keystone.color + "20", color: keystone.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onKeystoneClick(keystone);
                      }}
                    >
                      <div className="font-medium">{keystone.title}</div>
                      <div className="text-xs opacity-75">{keystone.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Year View Component
  const YearView = () => {
    const currentYear = selectedDay.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

    return (
      <div className="flex flex-1 flex-col rounded-xl border border-border overflow-hidden shadow-sm max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
          <h2 className="text-xl font-semibold text-card-foreground">{currentYear}</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setSelectedDay(add(selectedDay, { years: -1 }))} variant="outline" size="icon" className="rounded-full">
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm" className="rounded-full px-4">
              Today
            </Button>
            <Button onClick={() => setSelectedDay(add(selectedDay, { years: 1 }))} variant="outline" size="icon" className="rounded-full">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {months.map((month) => {
              const monthStart = startOfMonth(month);
              const monthEnd = endOfMonth(month);
              const monthDays = eachDayOfInterval({
                start: startOfWeek(monthStart),
                end: endOfWeek(monthEnd),
              });
              const monthKeystones = keystones.filter((keystone) =>
                keystone.date >= monthStart && keystone.date <= monthEnd
              );

              return (
                <div key={month.toString()} className="border border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors duration-200">
                  <h3 className="text-sm font-semibold text-center mb-2 text-card-foreground">
                    {format(month, "MMMM")}
                  </h3>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center text-muted-foreground font-medium p-1">
                        {day}
                      </div>
                    ))}
                    {monthDays.map((day) => {
                      const hasKeystones = keystones.some((keystone) => isSameDay(keystone.date, day));
                      return (
                        <div
                          key={day.toString()}
                          className={cn(
                            "text-center p-1 rounded cursor-pointer hover:bg-accent transition-colors duration-200",
                            !isSameMonth(day, month) && "text-muted-foreground",
                            isToday(day) && "bg-primary text-primary-foreground",
                            hasKeystones && "font-bold"
                          )}
                          onClick={() => {
                            setSelectedDay(day);
                            setCurrentMonth(format(day, "MMM-yyyy"));
                          }}
                        >
                          {format(day, "d")}
                        </div>
                      );
                    })}
                  </div>
                  {monthKeystones.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      {monthKeystones.length} keystone{monthKeystones.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = () => (
    <div className="flex flex-1 flex-col rounded-xl border border-border overflow-hidden shadow-sm max-h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
        <h2 className="text-xl font-semibold text-card-foreground">
          {format(firstDayCurrentMonth, "MMMM, yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={previousMonth} variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button onClick={goToToday} variant="outline" size="sm" className="rounded-full px-4 hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
            Today
          </Button>
          <Button onClick={nextMonth} variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border text-center text-sm font-medium text-muted-foreground bg-secondary/20">
        <div className="py-3">Sun</div>
        <div className="py-3">Mon</div>
        <div className="py-3">Tue</div>
        <div className="py-3">Wed</div>
        <div className="py-3">Thu</div>
        <div className="py-3">Fri</div>
        <div className="py-3">Sat</div>
      </div>

      {/* Calendar Days */}
      <div className="flex-1 grid grid-cols-7 bg-background overflow-auto min-h-0" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(120px, 1fr))` }}>
        {days.map((day, dayIdx) => {
          const dayKeystones = keystones.filter((keystone) =>
            isSameDay(keystone.date, day)
          );

          return (
            <div
              key={day.toString()}
              className={cn(
                "h-full min-h-[120px] border-r border-b border-border p-3 flex flex-col group",
                dayIdx === 0 && colStartClasses[getDay(day)],
                !isSameMonth(day, firstDayCurrentMonth) && "bg-muted/30 text-muted-foreground",
                isEqual(day, selectedDay) && "bg-accent/50",
                isToday(day) && "bg-primary/10",
                "hover:bg-accent/70 transition-colors duration-200 cursor-pointer"
              )}
              onClick={() => setSelectedDay(day)}
              onDoubleClick={() => onDayDoubleClick(day)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isToday(day) && "text-primary",
                    isEqual(day, selectedDay) && "text-accent-foreground",
                    !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-2 space-y-1 flex-1 overflow-hidden">
                {dayKeystones.slice(0, 3).map((keystone) => (
                  <div
                    key={keystone.id}
                    className="text-xs p-1.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 truncate"
                    style={{ backgroundColor: keystone.color + "20", color: keystone.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onKeystoneClick(keystone);
                    }}
                  >
                    {keystone.title}
                  </div>
                ))}
                {dayKeystones.length > 3 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    +{dayKeystones.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render based on view
  switch (view) {
    case "day":
      return <DayView />;
    case "week":
      return <WeekView />;
    case "year":
      return <YearView />;
    case "month":
    default:
      return <MonthView />;
  }
}

// Grid View Component
function GridView({
  keystones,
  onKeystoneClick,
}: {
  keystones: Keystone[];
  onKeystoneClick: (keystone: Keystone) => void;
}) {
  return (
    <div className="p-6 space-y-6 bg-background rounded-xl shadow-sm border border-border h-full overflow-auto">
      <h2 className="text-2xl font-bold text-foreground">All Keystones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {keystones.map((keystone) => (
          <motion.div
            key={keystone.id}
            className="p-5 border border-border rounded-xl cursor-pointer bg-card hover:bg-accent hover:border-primary transition-all duration-300 shadow-sm"
            onClick={() => onKeystoneClick(keystone)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: keystone.color }}
                />
                <h3 className="font-semibold text-lg text-card-foreground truncate">{keystone.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{keystone.description}</p>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{format(keystone.date, "MMM d, yyyy")} at {keystone.time}</span>
              </div>
              {keystone.location && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{keystone.location}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {keystones.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No keystones to display.
          </div>
        )}
      </div>
    </div>
  );
}

// Main Events Page Component
export default function Events() {
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get('contact');
  const isMobile = useIsMobile();
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [layoutView, setLayoutView] = useState<LayoutView>("calendar");
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isKeystoneFormOpen, setIsKeystoneFormOpen] = useState(false);
  const [initialCreateDate, setInitialCreateDate] = useState<Date | null>(null);

  const { events, isLoading, refetch } = useEvents({ contact_id: contactId || undefined });
  const { contacts } = useContacts();

  const filteredContact = contactId ? contacts.find(c => c.id === contactId) : undefined;

  // Transform events to keystones
  const keystones: Keystone[] = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.notes || '',
    date: new Date(event.date),
    time: event.time || '9:00 AM',
    location: '',
    attendees: event.contact_names || [],
    type: 'event' as const,
    color: getEventTypeColor(event.type)
  }));

  function getEventTypeColor(type: string): string {
    switch (type) {
      case 'keystone': return '#3b82f6';
      case 'interaction': return '#10b981';
      case 'birthday': return '#f59e0b';
      case 'sync': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setDetailDialogOpen(true);
  };

  const handleDayDoubleClick = (date: Date) => {
    setInitialCreateDate(date);
    setIsKeystoneFormOpen(true);
  };

  const handleKeystoneFormSuccess = () => {
    setIsKeystoneFormOpen(false);
    setInitialCreateDate(null);
    refetch();
  };

  const renderContent = () => {
    switch (layoutView) {
      case "calendar":
        return (
          <CalendarGrid
            keystones={keystones}
            onKeystoneClick={handleKeystoneClick}
            onDayDoubleClick={handleDayDoubleClick}
            view={calendarView}
          />
        );
      case "grid":
        return <GridView keystones={keystones} onKeystoneClick={handleKeystoneClick} />;
      default:
        return (
          <CalendarGrid
            keystones={keystones}
            onKeystoneClick={handleKeystoneClick}
            onDayDoubleClick={handleDayDoubleClick}
            view={calendarView}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </motion.div>
      </div>
    );
  }

  const keystoneFormContent = (
    <KeystoneForm 
      onSuccess={handleKeystoneFormSuccess}
      onCancel={() => setIsKeystoneFormOpen(false)}
      contact={filteredContact}
    />
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <div className="border-b border-border p-4 sm:p-6 bg-card shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <h1 className="text-3xl font-extrabold text-card-foreground tracking-tight">
              {filteredContact ? `${filteredContact.name}'s Events` : 'Events'}
            </h1>
            <div className="w-full sm:w-auto flex-grow">
              <KeystoneSearchBar />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-end w-full lg:w-auto">
            {layoutView === "calendar" && (
              <CalendarViewSelector view={calendarView} onViewChange={setCalendarView} />
            )}
            <LayoutViewSelector layout={layoutView} onLayoutChange={setLayoutView} />
            <Button
              className="rounded-full px-5 py-2.5 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 gap-2"
              onClick={() => {
                setInitialCreateDate(null);
                setIsKeystoneFormOpen(true);
              }}
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add Keystone
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden min-h-0">
        {renderContent()}
      </div>

      {/* Keystone Detail Dialog */}
      <KeystoneDetailDialog
        keystone={selectedKeystone}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Keystone Form Dialogs */}
      <AnimatePresence>
        {isMobile ? (
          <Sheet open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
            <SheetContent 
              side="bottom" 
              className="h-[90vh] overflow-auto pt-6 bg-white/95 backdrop-blur-xl border-white/30"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-white/40" />
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-foreground">Create New Keystone</SheetTitle>
                </SheetHeader>
                {keystoneFormContent}
              </motion.div>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isKeystoneFormOpen} onOpenChange={setIsKeystoneFormOpen}>
            <DialogContent className="sm:max-w-xl bg-white/95 backdrop-blur-xl border-white/30 rounded-2xl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {keystoneFormContent}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
