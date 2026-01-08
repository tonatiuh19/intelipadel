import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { AvailabilityData } from "@/store/slices/availabilitySlice";

interface CalendarSelectorProps {
  currentMonth: Date;
  selectedDate: Date;
  availability: AvailabilityData | null;
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarSelector({
  currentMonth,
  selectedDate,
  availability,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
}: CalendarSelectorProps) {
  const isDateBlocked = (date: Date): boolean => {
    if (!availability) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return availability.blockedSlots.some((slot) => {
      const blockDate = slot.block_date.split("T")[0];
      return blockDate === dateStr && slot.is_all_day;
    });
  };

  const isDatePartiallyBlocked = (date: Date): boolean => {
    if (!availability) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return availability.blockedSlots.some((slot) => {
      const blockDate = slot.block_date.split("T")[0];
      return blockDate === dateStr && !slot.is_all_day;
    });
  };

  const hasBookingsOnDate = (date: Date): boolean => {
    if (!availability) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return availability.bookings.some((booking) => {
      const bookingDate = booking.booking_date.split("T")[0];
      return bookingDate === dateStr;
    });
  };

  const hasEventsOnDate = (date: Date): boolean => {
    if (!availability || !availability.events) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return availability.events.some((event) => {
      const eventDate = event.event_date.split("T")[0];
      return eventDate === dateStr;
    });
  };

  const hasPrivateClassesOnDate = (date: Date): boolean => {
    if (!availability || !availability.privateClasses) return false;

    const dateStr = format(date, "yyyy-MM-dd");
    return availability.privateClasses.some((privateClass) => {
      const classDate = privateClass.class_date.split("T")[0];
      return classDate === dateStr;
    });
  };

  const generateCalendarDays = (): Date[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];

    // Add empty slots for days before month starts (adjust for Monday start)
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStart; i++) {
      days.push(new Date(year, month, -adjustedStart + i + 1));
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to complete the grid (6 rows)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-muted-foreground uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays().map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isBlocked = isDateBlocked(date);
          const isPartiallyBlocked = isDatePartiallyBlocked(date);
          const hasBookings = hasBookingsOnDate(date);
          const hasEvents = hasEventsOnDate(date);
          const hasPrivateClasses = hasPrivateClassesOnDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isPast =
            date < startOfDay(new Date()) && !isSameDay(date, new Date());
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={i}
              onClick={() =>
                !isBlocked && !isPast && isCurrentMonth && onDateSelect(date)
              }
              className={cn(
                "aspect-square p-2 rounded-lg text-center transition-all duration-200",
                "border-2 relative group",
                {
                  "bg-primary text-primary-foreground border-primary font-bold shadow-lg scale-105":
                    isSelected,
                  "bg-background hover:bg-muted border-border hover:border-primary/50":
                    !isSelected && !isBlocked && !isPast && isCurrentMonth,
                  "bg-muted/20 text-muted-foreground cursor-not-allowed opacity-40 border-transparent":
                    isBlocked || isPast || !isCurrentMonth,
                  "ring-2 ring-primary ring-offset-2": isToday && !isSelected,
                },
              )}
            >
              <div className="text-sm font-semibold whitespace-nowrap break-normal">
                {format(date, "d")}
              </div>
              {isPartiallyBlocked && !isBlocked && isCurrentMonth && (
                <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-orange-500 rounded-full" />
              )}
              {hasEvents && !isBlocked && !isSelected && isCurrentMonth && (
                <div className="absolute top-0.5 left-0.5 h-1.5 w-1.5 bg-purple-500 rounded-full" />
              )}
              {hasPrivateClasses &&
                !isBlocked &&
                !isSelected &&
                isCurrentMonth && (
                  <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-green-500 rounded-full mt-2" />
                )}
              {hasBookings && !isBlocked && !isSelected && isCurrentMonth && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
                  <div className="h-1 w-1 bg-primary rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {/* <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-primary rounded" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted/20 rounded relative">
            <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-orange-500 rounded-full" />
          </div>
          <span>Parcialmente disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted/20 rounded relative">
            <div className="absolute top-0 left-0 h-1.5 w-1.5 bg-purple-500 rounded-full" />
          </div>
          <span>Con eventos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted/20 rounded relative">
            <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-green-500 rounded-full" />
          </div>
          <span>Con clases privadas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted/20 opacity-50 rounded" />
          <span>No disponible</span>
        </div>
      </div> */}
    </Card>
  );
}
