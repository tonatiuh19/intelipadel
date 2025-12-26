import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, ArrowLeft, MapPin, Star } from "lucide-react";
import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBooking } from "@/store/slices/bookingsSlice";
import { fetchClubs } from "@/store/slices/clubsSlice";
import {
  fetchAvailability,
  clearAvailability,
} from "@/store/slices/availabilitySlice";
import { Club } from "@shared/types";
import { cn } from "@/lib/utils";
import CalendarSelector from "@/components/booking/CalendarSelector";
import CourtTimeSlotSelector from "@/components/booking/CourtTimeSlotSelector";

type BookingStep = "club" | "datetime" | "confirm" | "success";

interface Court {
  id: number;
  club_id: number;
  name: string;
  court_type: string;
  surface_type: string;
  has_lighting: boolean;
  is_active: boolean;
}

export default function BookingWizard() {
  const dispatch = useAppDispatch();
  const { clubs, loading: clubsLoading } = useAppSelector(
    (state) => state.clubs,
  );
  const { loading: bookingLoading } = useAppSelector((state) => state.bookings);
  const { data: availability, loading: loadingAvailability } = useAppSelector(
    (state) => state.availability,
  );

  const [step, setStep] = useState<BookingStep>("club");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [duration, setDuration] = useState<number>(60);

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  // Clear availability when leaving datetime step
  useEffect(() => {
    if (step !== "datetime") {
      dispatch(clearAvailability());
    }
  }, [step, dispatch]);

  // Fetch availability for specific date when selected
  const handleDateSelect = (date: Date) => {
    if (!selectedClub) {
      console.warn("No club selected");
      return;
    }

    // Check if already selected the same date - no need to refetch
    if (isSameDay(date, selectedDate) && availability) {
      console.log("Date already selected with availability data");
      return;
    }

    setSelectedDate(date);

    // Clear previously selected time and court
    setSelectedTime("");
    setSelectedCourt(null);

    // Fetch availability for the selected date + surrounding context
    const startDate = format(date, "yyyy-MM-dd");
    const endDate = format(addDays(date, 7), "yyyy-MM-dd");

    console.log(
      `Fetching availability for ${selectedClub.name} from ${startDate} to ${endDate}`,
    );

    dispatch(
      fetchAvailability({
        clubId: selectedClub.id,
        startDate,
        endDate,
      }),
    );
  };

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    setStep("datetime");
  };

  const handleSelectDateTime = (court: Court, time: string) => {
    setSelectedCourt(court);
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!selectedClub || !selectedDate || !selectedTime || !selectedCourt)
      return;

    await dispatch(
      createBooking({
        user_id: 1, // TODO: Get from auth state
        club_id: selectedClub.id,
        court_id: selectedCourt.id,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTime,
        end_time: `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1]}`,
        duration_minutes: duration,
        total_price: selectedClub.price_per_hour * (duration / 60),
      }),
    );

    setStep("success");
  };

  const goBack = () => {
    if (step === "datetime") {
      setStep("club");
      setSelectedClub(null);
    } else if (step === "confirm") {
      setStep("datetime");
      setSelectedTime("");
      setSelectedCourt(null);
    } else if (step === "success") {
      // Reset everything
      setStep("club");
      setSelectedClub(null);
      setSelectedDate(new Date());
      setSelectedTime("");
      setSelectedCourt(null);
      setDuration(60);
    }
  };

  const getStepNumber = () => {
    if (step === "club") return 1;
    if (step === "datetime") return 2;
    if (step === "confirm") return 3;
    return 3;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        {step !== "success" && (
          <div
            className={cn(
              "mb-8 transition-all duration-500 transform",
              "animate-in fade-in slide-in-from-top-4",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-foreground">
                {step === "club" && "Selecciona Tu Club"}
                {step === "datetime" && "Elige Fecha y Hora"}
                {step === "confirm" && "Confirma Tu Reserva"}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">
                Paso {getStepNumber()} de 3
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width:
                    step === "club"
                      ? "33%"
                      : step === "datetime"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Select Club */}
        {step === "club" && (
          <div
            className={cn(
              "space-y-4 transition-all duration-500 transform",
              "animate-in fade-in slide-in-from-right-4",
            )}
          >
            {clubsLoading ? (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Cargando clubes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club, index) => (
                  <Card
                    key={club.id}
                    className={cn(
                      "overflow-hidden cursor-pointer group",
                      "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                      "border-2 hover:border-primary",
                      "animate-in fade-in slide-in-from-bottom-4",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleSelectClub(club)}
                  >
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img
                        src={club.image_url}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-xl text-white mb-1">
                          {club.name}
                        </h3>
                        <p className="text-sm text-white/90 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {club.city}
                        </p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm ml-1">
                            {club.rating}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({club.review_count})
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Precio
                          </p>
                          <p className="font-bold text-primary text-lg">
                            €{club.price_per_hour}/hr
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Canchas
                          </p>
                          <p className="font-bold text-lg">
                            {club.court_count || 0}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        className="w-full group-hover:bg-primary group-hover:scale-105 transition-all"
                        size="sm"
                      >
                        Seleccionar Club
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === "datetime" && selectedClub && (
          <div
            className={cn(
              "space-y-6 transition-all duration-500 transform",
              "animate-in fade-in slide-in-from-right-4",
            )}
          >
            {/* Selected Club Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedClub.image_url}
                    alt={selectedClub.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedClub.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedClub.city}
                  </p>
                </div>
              </div>
            </Card>

            {/* Calendar */}
            <CalendarSelector
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              availability={availability}
              onDateSelect={handleDateSelect}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />

            {/* Time Slots */}
            <CourtTimeSlotSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedCourt={selectedCourt}
              availability={availability}
              loading={loadingAvailability}
              onSelectTimeSlot={handleSelectDateTime}
            />

            {/* Duration & Price */}
            {selectedTime && (
              <Card
                className={cn(
                  "p-6 bg-gradient-to-br from-primary/10 to-primary/5",
                  "animate-in fade-in slide-in-from-bottom-4",
                )}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Duración</span>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium"
                    >
                      <option value={60}>1 Hora</option>
                      <option value={90}>1.5 Horas</option>
                      <option value={120}>2 Horas</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-bold text-lg">Precio Total</span>
                    <span className="text-2xl font-bold text-primary">
                      €
                      {(selectedClub.price_per_hour * (duration / 60)).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={goBack}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                variant="default"
                onClick={() => setStep("confirm")}
                disabled={!selectedTime || !selectedCourt}
                className="flex-1"
                size="lg"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" &&
          selectedClub &&
          selectedDate &&
          selectedTime &&
          selectedCourt && (
            <div
              className={cn(
                "space-y-6 transition-all duration-500 transform",
                "animate-in fade-in slide-in-from-right-4",
              )}
            >
              <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="font-bold text-xl mb-6">Resumen de Reserva</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-4 border-b">
                    <span className="text-muted-foreground">Club</span>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {selectedClub.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedClub.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Cancha</span>
                    <p className="font-semibold text-lg">
                      {selectedCourt.name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Fecha y Hora</span>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Duración</span>
                    <p className="font-semibold text-lg">
                      {duration === 60 ? "1 hora" : `${duration / 60} horas`}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-xl font-bold">
                    <span>Precio Total</span>
                    <span className="text-primary">
                      €
                      {(selectedClub.price_per_hour * (duration / 60)).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">
                      ¡Cancha reservada para ti!
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      Recibirás un correo de confirmación con todos los
                      detalles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="flex-1"
                  size="lg"
                >
                  {bookingLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Reserva
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div
            className={cn(
              "text-center py-12 transition-all duration-500 transform",
              "animate-in fade-in zoom-in-95",
            )}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-in zoom-in-50 duration-700">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">¡Reserva Confirmada!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Tu reserva ha sido confirmada exitosamente. Recibirás un correo
              con todos los detalles.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/bookings")}
                size="lg"
              >
                Ver Mis Reservas
              </Button>
              <Button variant="default" onClick={goBack} size="lg">
                Nueva Reserva
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
