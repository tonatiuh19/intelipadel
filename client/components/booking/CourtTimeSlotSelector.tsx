import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Trophy,
  Users,
  DollarSign,
  Loader2,
  GraduationCap,
  Star,
  ChevronDown,
  ChevronUp,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { AvailabilityData } from "@/store/slices/availabilitySlice";
import { useState } from "react";

interface Court {
  id: number;
  club_id: number;
  name: string;
  court_type: string;
  surface_type: string;
  has_lighting: boolean;
  is_active: boolean;
}

interface Instructor {
  id: number;
  club_id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  hourly_rate: number;
  avatar_url?: string;
  rating?: number;
  review_count?: number;
  is_active: boolean;
  availability?: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
}

interface TimeSlot {
  time: string;
  endTime?: string;
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
  duration: number;
  calculatedPrice: number | null;
  onSelectTimeSlot: (court: Court, time: string) => void;
  onEventSelect?: (event: any) => void;
  onClassSelect?: (instructor: Instructor, time: string, court?: Court) => void;
  processingEventId?: number | null;
  instructors?: Instructor[];
  loadingInstructors?: boolean;
  selectedInstructor?: Instructor | null;
  onInstructorSelect?: (instructor: Instructor | null) => void;
  userSubscription?: any;
}

export default function CourtTimeSlotSelector({
  selectedDate,
  selectedTime,
  selectedCourt,
  availability,
  loading,
  duration,
  calculatedPrice,
  onSelectTimeSlot,
  onEventSelect,
  onClassSelect,
  processingEventId,
  instructors = [],
  loadingInstructors = false,
  selectedInstructor = null,
  onInstructorSelect,
  userSubscription,
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

    // If an instructor is selected, get their availability window for filtering
    let instructorStartTime: string | null = null;
    let instructorEndTime: string | null = null;

    if (
      selectedInstructor?.availability &&
      selectedInstructor.availability.length > 0
    ) {
      // Use the first availability slot (which should match the selected date's day)
      // Normalize to HH:MM format (database returns HH:MM:SS)
      instructorStartTime =
        selectedInstructor.availability[0].start_time.substring(0, 5);
      instructorEndTime = selectedInstructor.availability[0].end_time.substring(
        0,
        5,
      );
    }

    // Helper function to calculate end time based on duration
    const calculateEndTime = (
      startTime: string,
      durationMinutes: number,
    ): string => {
      const [hours, minutes] = startTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
    };

    // Helper function to check if time range overlaps with another range
    const timeRangesOverlap = (
      start1: string,
      end1: string,
      start2: string,
      end2: string,
    ): boolean => {
      return start1 < end2 && start2 < end1;
    };

    // Check club schedule for this day
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    const clubSchedule = availability.schedules?.find(
      (s: any) => s.day_of_week === dayOfWeek,
    );

    // Skip if club is closed on this day
    if (clubSchedule && clubSchedule.is_closed) {
      return [];
    }

    const opensAt = clubSchedule
      ? clubSchedule.opens_at.substring(0, 5)
      : "08:00";
    const closesAt = clubSchedule
      ? clubSchedule.closes_at.substring(0, 5)
      : "23:00";

    // Generate slots based on duration increment
    // Start from opening time and create slots every 'duration' minutes
    const startHour = parseInt(opensAt.split(":")[0]);
    const startMinute = parseInt(opensAt.split(":")[1]);
    let currentTimeMinutes = startHour * 60 + startMinute;

    const closesAtMinutes =
      parseInt(closesAt.split(":")[0]) * 60 + parseInt(closesAt.split(":")[1]);

    while (currentTimeMinutes + duration <= closesAtMinutes) {
      const hour = Math.floor(currentTimeMinutes / 60);
      const minute = currentTimeMinutes % 60;
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const endTime = calculateEndTime(time, duration);

      // Skip if instructor is selected and this slot is outside their availability
      if (instructorStartTime && instructorEndTime) {
        if (
          !timeRangesOverlap(
            time,
            endTime,
            instructorStartTime,
            instructorEndTime,
          )
        ) {
          currentTimeMinutes += duration;
          continue;
        }
      }

      availability.courts.forEach((court) => {
        // Check if court is blocked during this time slot
        const isBlocked = availability.blockedSlots.some((slot) => {
          const blockDate = slot.block_date.split("T")[0];
          if (blockDate !== dateStr) return false;
          if (slot.court_id && slot.court_id !== court.id) return false;

          if (slot.is_all_day) return true;

          if (slot.start_time && slot.end_time) {
            return timeRangesOverlap(
              time,
              endTime,
              slot.start_time,
              slot.end_time,
            );
          }

          return false;
        });

        // Check if court is booked during this time slot
        const isBooked = availability.bookings.some((booking) => {
          const bookingDate = booking.booking_date.split("T")[0];
          if (booking.court_id !== court.id || bookingDate !== dateStr)
            return false;

          // Normalize booking times to HH:MM format for comparison
          const bookingStartTime = booking.start_time.substring(0, 5);
          const bookingEndTime = booking.end_time.substring(0, 5);

          return timeRangesOverlap(
            time,
            endTime,
            bookingStartTime,
            bookingEndTime,
          );
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

              const scheduleStart = schedule.start_time.substring(0, 5);
              const scheduleEnd = schedule.end_time.substring(0, 5);

              return timeRangesOverlap(
                time,
                endTime,
                scheduleStart,
                scheduleEnd,
              );
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

              const eventStart = event.start_time.substring(0, 5);
              const eventEnd = event.end_time.substring(0, 5);

              return timeRangesOverlap(time, endTime, eventStart, eventEnd);
            }) || false;

        // Check if court is occupied by a private class
        const isPrivateClassOccupied =
          availability.privateClasses?.some((privateClass) => {
            const classDate = privateClass.class_date.split("T")[0];
            if (classDate !== dateStr) return false;
            if (privateClass.court_id !== court.id) return false;

            // Normalize times to HH:MM format for comparison
            const classStartTime = privateClass.start_time.substring(0, 5);
            const classEndTime = privateClass.end_time.substring(0, 5);

            return timeRangesOverlap(
              time,
              endTime,
              classStartTime,
              classEndTime,
            );
          }) || false;

        slots.push({
          time,
          endTime,
          available:
            !isBlocked &&
            !isBooked &&
            !isEventOccupied &&
            !isPrivateClassOccupied,
          courtId: court.id,
          courtName: court.name,
        });
      });

      // Move to next slot based on duration
      currentTimeMinutes += duration;
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
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            Eventos Disponibles
          </h3>
          <div className="space-y-3">
            {eventsForDate.map((event) => (
              <div
                key={event.id}
                className="bg-card rounded-lg p-4 border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-primary">{event.title}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {event.start_time.substring(0, 5)} -{" "}
                        {event.end_time.substring(0, 5)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.current_participants}/
                        {event.max_participants || "∞"} participantes
                      </div>
                      <div className="flex items-center gap-2">
                        {userSubscription?.subscription
                          ?.event_discount_percent ? (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary">
                                <Crown className="h-3 w-3 text-primary-foreground" />
                                <span className="text-xs font-bold text-white">
                                  -
                                  {
                                    userSubscription.subscription
                                      .event_discount_percent
                                  }
                                  %
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs text-primary line-through">
                                ${Number(event.registration_fee).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  $
                                  {(
                                    Number(event.registration_fee) *
                                    (1 -
                                      userSubscription.subscription
                                        .event_discount_percent /
                                        100)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-primary">
                              ${Number(event.registration_fee).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-gray-600">
                        Nivel:{" "}
                        {event.skill_level === "all"
                          ? "Todos"
                          : event.skill_level}
                      </div>
                    </div>
                    {event.prize_pool && Number(event.prize_pool) > 0 && (
                      <div className="mt-2 text-sm font-semibold text-primary">
                        Premio: ${Number(event.prize_pool).toFixed(2)}
                      </div>
                    )}
                    {getEventCourtInfo(event) && (
                      <div className="mt-2 pt-2 border-t border-primary/10 text-xs text-gray-500">
                        {getEventCourtInfo(event)}
                      </div>
                    )}
                  </div>
                  {onEventSelect && (
                    <Button
                      onClick={() => onEventSelect(event)}
                      disabled={processingEventId === event.id}
                      className="ml-0 sm:ml-4 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* Private Classes Section */}
      {instructors.length > 0 && onClassSelect && (
        <Card className="p-6 bg-card from-emerald-50 to-green-50 border-green-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            Clases Privadas Disponibles
          </h3>
          {loadingInstructors ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                Cargando instructores...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {instructors.map((instructor) => {
                const isSelected = selectedInstructor?.id === instructor.id;
                return (
                  <div
                    key={instructor.id}
                    className={cn(
                      "bg-card rounded-lg p-4 border-2 transition-all cursor-pointer",
                      isSelected
                        ? "border-green-600 ring-2 ring-green-200 shadow-lg"
                        : "border-green-200 hover:border-green-400",
                    )}
                    onClick={() =>
                      onInstructorSelect &&
                      onInstructorSelect(isSelected ? null : instructor)
                    }
                  >
                    <div className="flex items-start gap-4">
                      {instructor.avatar_url && (
                        <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={instructor.avatar_url}
                            alt={instructor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold">{instructor.name}</h4>
                            {instructor.rating && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Star className="h-3 w-3 fill-primary text-primary" />
                                <span className="font-medium">
                                  {instructor.rating}
                                </span>
                                {instructor.review_count && (
                                  <span className="text-gray-500">
                                    ({instructor.review_count})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {userSubscription?.subscription
                              ?.class_discount_percent ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary">
                                  <Crown className="h-3 w-3 text-primary-foreground" />
                                  <span className="text-xs font-bold text-white">
                                    -
                                    {
                                      userSubscription.subscription
                                        .class_discount_percent
                                    }
                                    %
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 line-through">
                                  ${instructor.hourly_rate}/hr
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  $
                                  {(
                                    instructor.hourly_rate *
                                    (1 -
                                      userSubscription.subscription
                                        .class_discount_percent /
                                        100)
                                  ).toFixed(2)}
                                  /hr
                                </div>
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-green-600">
                                ${instructor.hourly_rate}/hr
                              </div>
                            )}
                          </div>
                        </div>
                        {instructor.bio && (
                          <p className="text-sm mb-2">{instructor.bio}</p>
                        )}
                        {instructor.specialties &&
                          instructor.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {instructor.specialties.map((specialty, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          )}
                        {isSelected && (
                          <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                            <p className="text-xs text-green-800 font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Selecciona horario y cancha abajo
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Court Time Slots Section */}
      <Card
        className={cn(
          "p-6",
          selectedInstructor &&
            "border-2 border-green-400 bg-gradient-to-br from-emerald-50/30 to-green-50/30",
        )}
      >
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock
            className={cn(
              "h-5 w-5",
              selectedInstructor ? "text-green-600" : "text-primary",
            )}
          />
          {selectedInstructor ? (
            <span>
              Selecciona Hora y Cancha para Clase con {selectedInstructor.name}
            </span>
          ) : (
            "Selecciona Hora y Cancha"
          )}
          <span className="text-sm font-normal ml-auto">
            {format(selectedDate, "dd 'de' MMMM", { locale: es })}
          </span>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(groupedTimeSlots()).map(([time, slots]) => (
            <div
              key={time}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                selectedInstructor
                  ? "bg-secondary hover:bg-green-100"
                  : "bg-muted/30 hover:bg-muted/50",
              )}
            >
              <div
                className={cn(
                  "font-semibold min-w-[100px]",
                  selectedInstructor ? "text-green-900" : "text-foreground",
                )}
              >
                <div className="text-sm">{time}</div>
                {slots[0]?.endTime && (
                  <div className="text-xs text-muted-foreground">
                    → {slots[0].endTime}
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2 flex-wrap">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={`${time}-${slot.courtId}`}
                    onClick={() => {
                      if (slot.available && slot.courtId) {
                        const court = availability!.courts.find(
                          (c) => c.id === slot.courtId,
                        )!;
                        if (selectedInstructor && onClassSelect) {
                          // Instructor mode - only call class booking
                          // Pass court to class booking handler
                          onClassSelect(selectedInstructor, time, court);
                        } else {
                          // Regular mode - book court
                          onSelectTimeSlot(court, time);
                        }
                      }
                    }}
                    disabled={!slot.available}
                    className={cn(
                      "px-3 sm:px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                      "border-2",
                      {
                        // Selected state - different colors for instructor vs regular
                        "bg-card text-white border-green-600 shadow-md":
                          selectedInstructor &&
                          selectedTime === time &&
                          selectedCourt?.id === slot.courtId,
                        "bg-primary text-primary-foreground border-primary shadow-md":
                          !selectedInstructor &&
                          selectedTime === time &&
                          selectedCourt?.id === slot.courtId,
                        // Available state - different hover colors
                        "bg-white border-green-300 hover:border-green-500 hover:bg-green-100 text-green-900":
                          selectedInstructor &&
                          slot.available &&
                          !(
                            selectedTime === time &&
                            selectedCourt?.id === slot.courtId
                          ),
                        "bg-background border-border hover:border-primary hover:bg-primary/10":
                          !selectedInstructor &&
                          slot.available &&
                          !(
                            selectedTime === time &&
                            selectedCourt?.id === slot.courtId
                          ),
                        // Disabled state
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
