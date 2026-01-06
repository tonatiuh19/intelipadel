import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  startOfDay,
  addWeeks,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";

interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_price: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  club_name: string;
  court_name: string;
  booking_type?: "booking" | "class" | "event"; // Added to distinguish types
  class_type?: string; // For private classes
  instructor_name?: string; // For private classes
  event_title?: string; // For events
  event_type?: string; // For events
}

interface BookingCalendarProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

type ViewMode = "month" | "week" | "day";

export default function BookingCalendar({
  bookings,
  onBookingClick,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach((booking) => {
      const dateKey = format(new Date(booking.booking_date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, direction === "prev" ? -1 : 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, direction === "prev" ? -1 : 1));
    } else {
      setCurrentDate(addDays(currentDate, direction === "prev" ? -1 : 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string, bookingType?: string) => {
    // Events use orange theme
    if (bookingType === "event") {
      switch (status) {
        case "open":
        case "full":
          return "bg-primary";
        case "cancelled":
          return "bg-red-500";
        case "completed":
        case "in_progress":
          return "bg-primary/80";
        default:
          return "bg-primary/70";
      }
    }
    // Private classes use green theme
    if (bookingType === "class") {
      switch (status) {
        case "confirmed":
          return "bg-green-600";
        case "cancelled":
          return "bg-red-500";
        case "completed":
          return "bg-green-700";
        default:
          return "bg-green-500";
      }
    }
    // Regular bookings use blue/primary theme
    switch (status) {
      case "confirmed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-700";
      default:
        return "bg-yellow-500";
    }
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dayName) => (
          <div
            key={dayName}
            className="text-center font-semibold text-gray-600 py-2"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayBookings = bookingsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={idx}
              className={`min-h-32 border rounded-lg p-2 transition-all ${
                isCurrentMonth
                  ? "bg-muted hover:shadow-md"
                  : "bg-gray-50 opacity-50"
              } ${isDayToday ? "ring-2 ring-primary" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isDayToday
                    ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                    : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {format(day, "d")}
              </div>

              {/* Bookings for this day */}
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => {
                  const isClass = booking.booking_type === "class";
                  const isEvent = booking.booking_type === "event";

                  const colorClass = isEvent
                    ? booking.status === "open" || booking.status === "full"
                      ? "bg-secondary text-foreground hover:bg-secondary/80 border-l-2 border-primary"
                      : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : booking.status === "completed" ||
                            booking.status === "in_progress"
                          ? "bg-secondary/50 text-foreground hover:bg-secondary/70"
                          : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                    : isClass
                      ? booking.status === "confirmed"
                        ? "bg-secondary/50 hover:bg-green-200 border-l-2 border-green-600"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : booking.status === "completed"
                            ? "bg-secondary/50 text-green-900 hover:bg-muted"
                            : "bg-secondary/50 text-green-700 hover:bg-muted"
                      : booking.status === "confirmed"
                        ? "bg-secondary/50 hover:bg-blue-200 border-l-2 border-blue-600"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : booking.status === "completed"
                            ? "bg-secondary/50 text-blue-900 hover:bg-blue-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";

                  return (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick?.(booking)}
                      className={`text-xs p-1 rounded cursor-pointer hover:scale-105 transition-transform ${colorClass}`}
                    >
                      <div className="font-semibold truncate">
                        {booking.start_time} {isClass && "🎓"} {isEvent && "🏆"}
                      </div>
                      <div className="truncate">
                        {isEvent && booking.event_title
                          ? booking.event_title
                          : isClass && booking.instructor_name
                            ? `${booking.instructor_name} - ${booking.user_name}`
                            : booking.user_name}
                      </div>
                    </div>
                  );
                })}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayBookings.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: es });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center font-semibold text-gray-600 py-2">
              Hora
            </div>
            {days.map((day) => (
              <div
                key={day.toString()}
                className={`text-center py-2 rounded-lg ${
                  isToday(day)
                    ? "bg-primary text-primary-foreground font-bold"
                    : "font-semibold text-gray-600"
                }`}
              >
                <div className="text-xs">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className="text-lg">{format(day, "d")}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="space-y-1">
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-2">
                <div className="text-sm text-gray-600 py-2 text-center">
                  {hour}:00
                </div>
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayBookings = (bookingsByDate[dateKey] || []).filter(
                    (b) => {
                      const bookingHour = parseInt(b.start_time.split(":")[0]);
                      return bookingHour === hour;
                    },
                  );

                  return (
                    <div
                      key={day.toString()}
                      className="border rounded p-1 min-h-16 bg-secondary hover:bg-gray-50"
                    >
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => onBookingClick?.(booking)}
                          className={`text-xs p-1 rounded mb-1 cursor-pointer hover:scale-105 transition-transform ${
                            booking.status === "confirmed"
                              ? "bg-secondary/50 text-white"
                              : booking.status === "cancelled"
                                ? "bg-red-500 text-white"
                                : booking.status === "completed"
                                  ? "bg-blue-500 text-white"
                                  : "bg-yellow-500 text-white"
                          }`}
                        >
                          <div className="font-semibold">
                            {booking.start_time} - {booking.end_time}
                          </div>
                          <div className="truncate">{booking.user_name}</div>
                          <div className="truncate text-[10px]">
                            {booking.court_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const dayBookings = bookingsByDate[dateKey] || [];
    const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

    return (
      <div className="space-y-2">
        <div className="text-center bg-primary text-primary-foreground rounded-lg py-4">
          <div className="text-3xl font-bold">{format(currentDate, "d")}</div>
          <div className="text-lg">
            {format(currentDate, "EEEE, MMMM yyyy", { locale: es })}
          </div>
          <div className="text-sm mt-1">{dayBookings.length} reservaciones</div>
        </div>

        <div className="grid gap-2">
          {timeSlots.map((hour) => {
            const hourBookings = dayBookings.filter((b) => {
              const bookingHour = parseInt(b.start_time.split(":")[0]);
              return bookingHour === hour;
            });

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-20 text-sm text-gray-600 font-medium pt-2">
                  {hour}:00
                </div>
                <div className="flex-1 space-y-2">
                  {hourBookings.length > 0 ? (
                    hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick?.(booking)}
                        className={`p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all ${
                          booking.status === "confirmed"
                            ? "bg-secondary/50 border-l-4 border-green-500"
                            : booking.status === "cancelled"
                              ? "bg-red-50 border-l-4 border-red-500"
                              : booking.status === "completed"
                                ? "bg-secondary/50 border-l-4 border-blue-500"
                                : "bg-secondary/50 border-l-4 border-yellow-500"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold">{booking.user_name}</div>
                            <div className="text-sm">
                              {booking.user_email} • {booking.user_phone}
                            </div>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="font-medium">
                                🏟️ {booking.club_name}
                              </span>
                              <span className="font-medium">
                                🎾 {booking.court_name}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold ">
                              {booking.start_time} - {booking.end_time}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${booking.total_price}
                            </div>
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : booking.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm italic py-2">
                      Sin reservaciones
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* View Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => setViewMode("month")}
              className={
                viewMode === "month" ? "bg-primary text-primary-foreground" : ""
              }
            >
              Mes
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              className={
                viewMode === "week" ? "bg-primary text-primary-foreground" : ""
              }
            >
              Semana
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              onClick={() => setViewMode("day")}
              className={
                viewMode === "day" ? "bg-primary text-primary-foreground" : ""
              }
            >
              Día
            </Button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" onClick={goToToday}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoy
            </Button>

            <div className="text-lg font-bold min-w-[200px] text-center">
              {viewMode === "month" &&
                format(currentDate, "MMMM yyyy", { locale: es })}
              {viewMode === "week" &&
                `${format(startOfWeek(currentDate, { locale: es }), "d MMM", { locale: es })} - ${format(endOfWeek(currentDate, { locale: es }), "d MMM yyyy", { locale: es })}`}
              {viewMode === "day" &&
                format(currentDate, "d MMMM yyyy", { locale: es })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="animate-fade-in">
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border-l-2 border-blue-700"></div>
            <span className="text-sm text-gray-600">Reserva de Cancha</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border-l-2 border-green-700"></div>
            <span className="text-sm text-gray-600">Clase Privada 🎓</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary border-l-2 border-primary"></div>
            <span className="text-sm text-gray-600">Evento 🏆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Cancelada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
