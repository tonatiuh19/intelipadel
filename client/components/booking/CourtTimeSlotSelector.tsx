import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Users, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { AvailabilityData } from "@/store/slices/availabilitySlice";

interface Court {
  id: number;
  club_id: number;
  name: string;
  court_type: string;
  surface_type: string;
  has_lighting: boolean;
  is_active: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  courtId?: number;
  courtName?: string;
}

interface CourtTimeSlotSelectorProps {
  selectedDate: Date;
  selectedTime: string;
  selectedCourt: Court | null;
  availability: AvailabilityData | null;
  loading: boolean;
  onSelectTimeSlot: (court: Court, time: string) => void;
  onEventSelect?: (event: any) => void;
  processingEventId?: number | null;
}

export default function CourtTimeSlotSelector({
  selectedDate,
  selectedTime,
  selectedCourt,
  availability,
  loading,
  onSelectTimeSlot,
  onEventSelect,
  processingEventId,
}: CourtTimeSlotSelectorProps) {
  // Filter events for the selected date
  const getEventsForDate = () => {
    if (!availability?.events) return [];

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return availability.events.filter((event) => {
      const eventDate = event.event_date.split("T")[0];
      return eventDate === dateStr && event.status === "open";
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tournament: "Torneo",
      league: "Liga",
      clinic: "Clínica",
      social: "Social",
      championship: "Campeonato",
    };
    return labels[type] || type;
  };

  // Get court names for an event
  const getEventCourtInfo = (event: any) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Check if event has granular court schedules
    const eventSchedules = availability?.eventCourtSchedules?.filter(
      (schedule) => {
        const scheduleDate = schedule.event_date.split("T")[0];
        return scheduleDate === dateStr && schedule.event_id === event.id;
      },
    );

    if (eventSchedules && eventSchedules.length > 0) {
      // Group schedules by court
      const courtScheduleMap = new Map();
      eventSchedules.forEach((schedule) => {
        const court = availability?.courts.find(
          (c) => c.id === schedule.court_id,
        );
        if (court) {
          if (!courtScheduleMap.has(court.name)) {
            courtScheduleMap.set(court.name, []);
          }
          courtScheduleMap.get(court.name).push({
            start: schedule.start_time.substring(0, 5),
            end: schedule.end_time.substring(0, 5),
          });
        }
      });

      // Format: "Cancha 1 (08:00-12:00), Cancha 2 (14:00-16:00)"
      return Array.from(courtScheduleMap.entries())
        .map(([courtName, times]) => {
          const timeRanges = times
            .map((t: any) => `${t.start}-${t.end}`)
            .join(", ");
          return `${courtName} (${timeRanges})`;
        })
        .join(", ");
    }

    // Fall back to courts_used (all event duration)
    if (event.courts_used && event.courts_used.length > 0) {
      const courtsUsed =
        typeof event.courts_used === "string"
          ? JSON.parse(event.courts_used)
          : event.courts_used;

      const courtNames = courtsUsed
        .map((courtId: number) => {
          const court = availability?.courts.find((c) => c.id === courtId);
          return court?.name;
        })
        .filter(Boolean);

      return courtNames.length > 0 ? `Canchas: ${courtNames.join(", ")}` : null;
    }

    return null;
  };

  const generateTimeSlots = (): TimeSlot[] => {
    if (!availability) return [];

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slots: TimeSlot[] = [];

    // Generate hourly slots from 8:00 to 22:00
    for (let hour = 8; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;

      availability.courts.forEach((court) => {
        // Check if court is blocked at this time
        const isBlocked = availability.blockedSlots.some((slot) => {
          const blockDate = slot.block_date.split("T")[0];
          if (blockDate !== dateStr) return false;
          if (slot.court_id && slot.court_id !== court.id) return false;

          if (slot.is_all_day) return true;

          if (slot.start_time && slot.end_time) {
            return time >= slot.start_time && time < slot.end_time;
          }

          return false;
        });

        // Check if court is booked at this time
        const isBooked = availability.bookings.some((booking) => {
          const bookingDate = booking.booking_date.split("T")[0];
          if (booking.court_id !== court.id || bookingDate !== dateStr)
            return false;

          // Normalize booking times to HH:MM format for comparison
          const bookingStartTime = booking.start_time.substring(0, 5);
          const bookingEndTime = booking.end_time.substring(0, 5);

          return time >= bookingStartTime && time < bookingEndTime;
        });

        // Check if court is occupied by an event
        // First check granular event_court_schedules, if they exist for this court/date, use ONLY those
        // Otherwise fall back to event's main courts_used times
        // Round event times to full hours (down for start, up for end) since users book hourly

        // Check if this court has any granular schedules for this date
        const courtHasSchedule = availability.eventCourtSchedules?.some(
          (schedule) => {
            const scheduleDate = schedule.event_date.split("T")[0];
            return scheduleDate === dateStr && schedule.court_id === court.id;
          },
        );

        const isEventOccupied = courtHasSchedule
          ? // Use granular schedules ONLY
            availability.eventCourtSchedules?.some((schedule) => {
              const scheduleDate = schedule.event_date.split("T")[0];
              if (scheduleDate !== dateStr || schedule.court_id !== court.id)
                return false;

              // Round start time down to the hour (15:30 -> 15:00)
              const scheduleStartHour = schedule.start_time.substring(0, 2);
              const roundedStart = `${scheduleStartHour}:00`;

              // Round end time up to the hour if it has minutes (15:30 -> 16:00, 17:00 -> 17:00)
              const timeStr = schedule.end_time.substring(0, 5); // Get HH:MM only
              const [endHour, endMin] = timeStr.split(":");
              const roundedEnd =
                endMin !== "00"
                  ? `${(parseInt(endHour) + 1).toString().padStart(2, "0")}:00`
                  : `${endHour}:00`;

              return time >= roundedStart && time < roundedEnd;
            }) || false
          : // Fall back to event's main times only if no granular schedule exists
            availability.events?.some((event) => {
              const eventDate = event.event_date.split("T")[0];
              if (eventDate !== dateStr) return false;
              if (!event.courts_used) return false;

              const courtsUsed =
                typeof event.courts_used === "string"
                  ? JSON.parse(event.courts_used)
                  : event.courts_used;

              if (!courtsUsed.includes(court.id)) return false;

              // Round event times to full hours
              const eventStartHour = event.start_time.substring(0, 2);
              const roundedStart = `${eventStartHour}:00`;

              const timeStr = event.end_time.substring(0, 5); // Get HH:MM only
              const [endHour, endMin] = timeStr.split(":");
              const roundedEnd =
                endMin !== "00"
                  ? `${(parseInt(endHour) + 1).toString().padStart(2, "0")}:00`
                  : `${endHour}:00`;

              return time >= roundedStart && time < roundedEnd;
            }) || false;

        // Check if court is occupied by a private class
        const isPrivateClassOccupied =
          availability.privateClasses?.some((privateClass) => {
            const classDate = privateClass.class_date.split("T")[0];
            if (classDate !== dateStr) return false;
            if (privateClass.court_id !== court.id) return false;

            return (
              time >= privateClass.start_time && time < privateClass.end_time
            );
          }) || false;

        slots.push({
          time,
          available:
            !isBlocked &&
            !isBooked &&
            !isEventOccupied &&
            !isPrivateClassOccupied,
          courtId: court.id,
          courtName: court.name,
        });

        // Debug: Log when a slot is marked unavailable due to event
        if (
          isEventOccupied &&
          (time === "15:00" || time === "16:00" || time === "17:00")
        ) {
          console.log(`✓ Slot marked unavailable:`, {
            court: court.name,
            time,
            isEventOccupied,
            available:
              !isBlocked &&
              !isBooked &&
              !isEventOccupied &&
              !isPrivateClassOccupied,
          });
        }
      });
    }

    return slots;
  };

  const groupedTimeSlots = (): Record<string, TimeSlot[]> => {
    const slots = generateTimeSlots();
    const grouped: Record<string, TimeSlot[]> = {};

    slots.forEach((slot) => {
      if (!grouped[slot.time]) {
        grouped[slot.time] = [];
      }
      grouped[slot.time].push(slot);
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            Cargando disponibilidad...
          </p>
        </div>
      </Card>
    );
  }

  if (!availability) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Selecciona una fecha en el calendario para ver la disponibilidad
          </p>
        </div>
      </Card>
    );
  }

  const eventsForDate = getEventsForDate();

  return (
    <div className="space-y-4">
      {/* Events Section */}
      {eventsForDate.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-900">
            <Trophy className="h-5 w-5 text-orange-600" />
            Eventos Disponibles
          </h3>
          <div className="space-y-3">
            {eventsForDate.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{event.title}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {event.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {event.start_time.substring(0, 5)} -{" "}
                        {event.end_time.substring(0, 5)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        {event.current_participants}/
                        {event.max_participants || "∞"} participantes
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />$
                        {Number(event.registration_fee).toFixed(2)}
                      </div>
                      <div className="text-gray-600">
                        Nivel:{" "}
                        {event.skill_level === "all"
                          ? "Todos"
                          : event.skill_level}
                      </div>
                    </div>
                    {event.prize_pool && Number(event.prize_pool) > 0 && (
                      <div className="mt-2 text-sm font-semibold text-orange-600">
                        Premio: ${Number(event.prize_pool).toFixed(2)}
                      </div>
                    )}
                    {getEventCourtInfo(event) && (
                      <div className="mt-2 pt-2 border-t border-orange-100 text-xs text-gray-500">
                        {getEventCourtInfo(event)}
                      </div>
                    )}
                  </div>
                  {onEventSelect && (
                    <Button
                      onClick={() => onEventSelect(event)}
                      disabled={processingEventId === event.id}
                      className="ml-4 bg-orange-600 hover:bg-orange-700"
                    >
                      {processingEventId === event.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Inscribirse"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Court Time Slots Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Selecciona Hora y Cancha
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {format(selectedDate, "dd 'de' MMMM", { locale: es })}
          </span>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(groupedTimeSlots()).map(([time, slots]) => (
            <div
              key={time}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-semibold text-foreground min-w-[60px]">
                {time}
              </div>
              <div className="flex-1 flex gap-2 flex-wrap">
                {slots.map((slot) => (
                  <button
                    key={`${time}-${slot.courtId}`}
                    onClick={() =>
                      slot.available &&
                      slot.courtId &&
                      onSelectTimeSlot(
                        availability!.courts.find(
                          (c) => c.id === slot.courtId,
                        )!,
                        time,
                      )
                    }
                    disabled={!slot.available}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "border-2",
                      {
                        "bg-primary text-primary-foreground border-primary shadow-md":
                          selectedTime === time &&
                          selectedCourt?.id === slot.courtId,
                        "bg-background border-border hover:border-primary hover:bg-primary/10":
                          slot.available &&
                          !(
                            selectedTime === time &&
                            selectedCourt?.id === slot.courtId
                          ),
                        "bg-muted/20 text-muted-foreground border-transparent cursor-not-allowed opacity-50":
                          !slot.available,
                      },
                    )}
                  >
                    {slot.courtName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
