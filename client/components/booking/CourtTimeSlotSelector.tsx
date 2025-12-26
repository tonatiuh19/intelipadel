import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
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
}

export default function CourtTimeSlotSelector({
  selectedDate,
  selectedTime,
  selectedCourt,
  availability,
  loading,
  onSelectTimeSlot,
}: CourtTimeSlotSelectorProps) {
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
          return (
            booking.court_id === court.id &&
            bookingDate === dateStr &&
            time >= booking.start_time &&
            time < booking.end_time
          );
        });

        // Check if court is occupied by an event
        const isEventOccupied =
          availability.events?.some((event) => {
            const eventDate = event.event_date.split("T")[0];
            if (eventDate !== dateStr) return false;
            if (!event.courts_used) return false;

            const courtsUsed =
              typeof event.courts_used === "string"
                ? JSON.parse(event.courts_used)
                : event.courts_used;

            if (!courtsUsed.includes(court.id)) return false;

            return time >= event.start_time && time < event.end_time;
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

  return (
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
                      availability!.courts.find((c) => c.id === slot.courtId)!,
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
  );
}
