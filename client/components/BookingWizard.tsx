import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, ArrowLeft, MapPin, Star } from "lucide-react";
import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClubs } from "@/store/slices/clubsSlice";
import { setTempClubId } from "@/store/slices/authSlice";
import {
  fetchAvailability,
  clearAvailability,
} from "@/store/slices/availabilitySlice";
import {
  fetchInstructors,
  clearInstructors,
} from "@/store/slices/instructorsSlice";
import { createPaymentIntent, resetPayment } from "@/store/slices/paymentSlice";
import {
  createEventPaymentIntent,
  resetEventPayment,
} from "@/store/slices/eventPaymentSlice";
import {
  createClassPaymentIntent,
  resetClassPayment,
} from "@/store/slices/classPaymentSlice";
import { Club } from "@shared/types";
import type { Event, PrivateClass } from "@shared/types";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CalendarSelector from "@/components/booking/CalendarSelector";
import CourtTimeSlotSelector from "@/components/booking/CourtTimeSlotSelector";
import AuthModal from "@/components/auth/AuthModal";
import BookingSummary from "@/components/booking/BookingSummary";
import EventRegistrationSummary from "@/components/booking/EventRegistrationSummary";
import ClassRegistrationSummary from "@/components/booking/ClassRegistrationSummary";
import StripePaymentForm from "@/components/booking/StripePaymentForm";
import PaymentSuccessModal from "@/components/booking/PaymentSuccessModal";
import PaymentFailedModal from "@/components/booking/PaymentFailedModal";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

type BookingStep = "club" | "datetime" | "auth" | "payment" | "success";

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
}

export default function BookingWizard() {
  const dispatch = useAppDispatch();
  const { clubs, loading: clubsLoading } = useAppSelector(
    (state) => state.clubs,
  );
  const { data: availability, loading: loadingAvailability } = useAppSelector(
    (state) => state.availability,
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { clientSecret, loading: paymentLoading } = useAppSelector(
    (state) => state.payment,
  );
  const {
    clientSecret: eventClientSecret,
    loading: eventPaymentLoading,
    registrationNumber,
  } = useAppSelector((state) => state.eventPayment);
  const {
    clientSecret: classClientSecret,
    loading: classPaymentLoading,
    bookingNumber: classBookingNumber,
  } = useAppSelector((state) => state.classPayment);
  const { instructors, loading: loadingInstructors } = useAppSelector(
    (state) => state.instructors,
  );

  const [step, setStep] = useState<BookingStep>("club");
  const [flowType, setFlowType] = useState<
    "booking" | "event" | "class" | null
  >(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [selectedInstructorForUI, setSelectedInstructorForUI] =
    useState<Instructor | null>(null);
  const [classType, setClassType] = useState<
    "individual" | "group" | "semi_private"
  >("individual");
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [bookingNumber, setBookingNumber] = useState<string>("");
  const [processingEventId, setProcessingEventId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  // Fetch instructors when club is selected or date changes
  useEffect(() => {
    if (selectedClub && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      dispatch(fetchInstructors({ clubId: selectedClub.id, date: dateStr }));
    } else if (selectedClub) {
      dispatch(fetchInstructors({ clubId: selectedClub.id }));
    }
  }, [selectedClub, selectedDate, dispatch]);

  // Clear availability and instructors when leaving datetime step
  useEffect(() => {
    if (step !== "datetime") {
      dispatch(clearAvailability());
      dispatch(clearInstructors());
    }
  }, [step, dispatch]);

  // Watch for authentication success to proceed to payment
  useEffect(() => {
    if (step === "auth" && isAuthenticated) {
      setShowAuthModal(false);
      if (flowType === "event") {
        handleProceedToEventPayment();
      } else if (flowType === "class") {
        handleProceedToClassPayment();
      } else {
        handleProceedToPayment();
      }
    }
  }, [isAuthenticated, step, flowType]);

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
    // Only set flowType to booking if no other flow is active
    if (!flowType || flowType === "booking") {
      setFlowType("booking");
    }
  };

  const handleSelectEvent = async (event: Event) => {
    setSelectedEvent(event);
    setFlowType("event");
    setProcessingEventId(event.id);

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Set club_id before showing auth modal
      if (selectedClub) {
        dispatch(setTempClubId(selectedClub.id));
      }
      setStep("auth");
      setShowAuthModal(true);
      setProcessingEventId(null);
    } else {
      // Check if user is trying to register at a different club
      if (
        user &&
        selectedClub &&
        user.club_id &&
        user.club_id !== selectedClub.id
      ) {
        // User authenticated but at different club - need new account
        dispatch(setTempClubId(selectedClub.id));
        setStep("auth");
        setShowAuthModal(true);
        setProcessingEventId(null);
      } else {
        // Same club or no club restriction - proceed
        await handleProceedToEventPayment(event);
        setProcessingEventId(null);
      }
    }
  };

  const handleSelectClass = async (
    instructor: Instructor,
    time: string,
    court?: Court,
  ) => {
    setSelectedInstructor(instructor);
    setSelectedTime(time);
    if (court) {
      setSelectedCourt(court);
    }
    setFlowType("class");
    // Don't clear selectedInstructorForUI here - keep it for visual feedback

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (selectedClub) {
        dispatch(setTempClubId(selectedClub.id));
      }
      setStep("auth");
      setShowAuthModal(true);
    } else {
      // Check if user is trying to book at a different club
      if (
        user &&
        selectedClub &&
        user.club_id &&
        user.club_id !== selectedClub.id
      ) {
        dispatch(setTempClubId(selectedClub.id));
        setStep("auth");
        setShowAuthModal(true);
      }
      // Don't auto-proceed to payment - let user review and click Continue
    }
  };

  const handleProceedToEventPayment = async (event?: Event) => {
    const eventToUse = event || selectedEvent;

    if (!eventToUse || !user) {
      return;
    }

    const eventData = {
      user_id: user.id,
      event_id: eventToUse.id,
      registration_fee: Number(eventToUse.registration_fee),
    };

    // Create payment intent for event
    await dispatch(createEventPaymentIntent(eventData));
    setStep("payment");
  };

  const handleProceedToClassPayment = async () => {
    if (
      !selectedClub ||
      !selectedInstructor ||
      !selectedDate ||
      !selectedTime ||
      !user
    ) {
      return;
    }

    const endTime = `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`;

    const classData = {
      user_id: user.id,
      instructor_id: selectedInstructor.id,
      club_id: selectedClub.id,
      court_id: selectedCourt?.id,
      class_type: classType,
      class_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedTime,
      end_time: endTime,
      duration_minutes: duration,
      number_of_students: numberOfStudents,
      total_price: selectedInstructor.hourly_rate * (duration / 60),
    };

    // Create payment intent for class
    await dispatch(createClassPaymentIntent(classData));
    setStep("payment");
  };

  const handleContinueToPayment = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Set club_id before showing auth modal
      if (selectedClub) {
        dispatch(setTempClubId(selectedClub.id));
      }
      setStep("auth");
      setShowAuthModal(true);
    } else {
      // Check if user is trying to book at a different club
      if (
        user &&
        selectedClub &&
        user.club_id &&
        user.club_id !== selectedClub.id
      ) {
        // User is authenticated but at a different club
        // Show auth modal to create new account for this club
        dispatch(setTempClubId(selectedClub.id));
        setStep("auth");
        setShowAuthModal(true);
      } else {
        // Same club or no club restriction - proceed to payment
        handleProceedToPayment();
      }
    }
  };

  const handleProceedToPayment = async () => {
    if (
      !selectedClub ||
      !selectedDate ||
      !selectedTime ||
      !selectedCourt ||
      !user
    ) {
      return;
    }

    const bookingData = {
      user_id: user.id,
      club_id: selectedClub.id,
      court_id: selectedCourt.id,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedTime,
      end_time: `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`,
      duration_minutes: duration,
      total_price: selectedClub.price_per_hour * (duration / 60),
    };

    // Create payment intent
    await dispatch(createPaymentIntent(bookingData));
    setStep("payment");
  };

  const handlePaymentSuccess = () => {
    setShowSuccessModal(true);
    setStep("success");
  };

  const handlePaymentError = () => {
    setShowFailedModal(true);
  };

  const handleRetryPayment = () => {
    setShowFailedModal(false);
    // Stay on payment step to retry
  };

  const goBack = () => {
    if (step === "datetime") {
      setStep("club");
      setSelectedClub(null);
      setFlowType(null);
      setSelectedInstructorForUI(null);
    } else if (step === "auth") {
      setStep("datetime");
      setShowAuthModal(false);
    } else if (step === "payment") {
      setStep("datetime");
      // Clear selections when going back from payment
      setSelectedInstructorForUI(null);
      setSelectedInstructor(null);
      if (flowType === "event") {
        dispatch(resetEventPayment());
      } else if (flowType === "class") {
        dispatch(resetClassPayment());
      } else {
        dispatch(resetPayment());
      }
    } else if (step === "success") {
      // Reset everything
      setStep("club");
      setSelectedClub(null);
      setSelectedEvent(null);
      setSelectedInstructor(null);
      setSelectedInstructorForUI(null); // Clear UI selection
      setSelectedDate(new Date());
      setCurrentMonth(new Date());
      setSelectedTime("");
      setSelectedCourt(null);
      setDuration(60);
      setFlowType(null);
      setShowSuccessModal(false);
      setShowFailedModal(false);
      setBookingNumber("");
      setClassType("individual");
      setNumberOfStudents(1);
      dispatch(resetPayment());
      dispatch(resetEventPayment());
      dispatch(resetClassPayment());
    }
  };

  const getStepNumber = () => {
    if (step === "club") return 1;
    if (step === "datetime") return 2;
    if (step === "auth") return 3;
    if (step === "payment") return 4;
    return 4;
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
                {step === "auth" && "Inicia Sesión"}
                {step === "payment" && "Completa el Pago"}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">
                Paso {getStepNumber()} de 4
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width:
                    step === "club"
                      ? "25%"
                      : step === "datetime"
                        ? "50%"
                        : step === "auth"
                          ? "75%"
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
                            ${club.price_per_hour}/hr
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
              onEventSelect={handleSelectEvent}
              onClassSelect={handleSelectClass}
              processingEventId={processingEventId}
              instructors={instructors}
              loadingInstructors={loadingInstructors}
              selectedInstructor={selectedInstructorForUI}
              onInstructorSelect={setSelectedInstructorForUI}
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
                      $
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
              {/* Show Continue button for regular bookings or classes */}
              {((selectedTime && selectedCourt && flowType === "booking") ||
                (selectedTime &&
                  selectedInstructor &&
                  flowType === "class")) && (
                <Button
                  onClick={
                    flowType === "class"
                      ? handleProceedToClassPayment
                      : handleContinueToPayment
                  }
                  className="flex-1"
                  size="lg"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Auth Modal */}
        {step === "auth" && (
          <AuthModal
            open={showAuthModal}
            onOpenChange={(open) => {
              setShowAuthModal(open);
              if (!open) {
                setStep("datetime");
              }
            }}
          />
        )}

        {/* Step 4: Payment - Booking Flow */}
        {step === "payment" &&
          flowType === "booking" &&
          selectedClub &&
          selectedDate &&
          selectedTime &&
          selectedCourt &&
          user && (
            <div
              className={cn(
                "grid lg:grid-cols-2 gap-8 transition-all duration-500 transform",
                "animate-in fade-in slide-in-from-right-4",
              )}
            >
              {/* Left: Payment Form */}
              <div className="space-y-6">
                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      locale: "es",
                      appearance: {
                        theme: "stripe",
                      },
                    }}
                  >
                    <StripePaymentForm
                      bookingData={{
                        user_id: user.id,
                        club_id: selectedClub.id,
                        court_id: selectedCourt.id,
                        booking_date: format(selectedDate, "yyyy-MM-dd"),
                        start_time: selectedTime,
                        end_time: `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`,
                        duration_minutes: duration,
                        total_price:
                          selectedClub.price_per_hour * (duration / 60),
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}

                {!clientSecret && paymentLoading && (
                  <Card className="p-8">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-4 text-muted-foreground">
                        Preparando pago...
                      </p>
                    </div>
                  </Card>
                )}

                <Button
                  variant="outline"
                  onClick={goBack}
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Selección
                </Button>
              </div>

              {/* Right: Booking Summary */}
              <div>
                <BookingSummary
                  club={selectedClub}
                  court={selectedCourt}
                  date={selectedDate}
                  startTime={selectedTime}
                  endTime={`${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`}
                  duration={duration}
                  totalPrice={selectedClub.price_per_hour * (duration / 60)}
                  onBack={goBack}
                />
              </div>
            </div>
          )}

        {/* Step 4: Payment - Event Flow */}
        {step === "payment" &&
          flowType === "event" &&
          selectedClub &&
          selectedEvent &&
          user && (
            <div
              className={cn(
                "max-w-2xl mx-auto transition-all duration-500 transform",
                "animate-in fade-in slide-in-from-right-4",
              )}
            >
              {eventClientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: eventClientSecret,
                    locale: "es",
                    appearance: {
                      theme: "stripe",
                    },
                  }}
                >
                  <StripePaymentForm
                    eventData={{
                      user_id: user.id,
                      event_id: selectedEvent.id,
                      registration_fee: Number(selectedEvent.registration_fee),
                    }}
                    clubId={selectedClub.id}
                    clubName={selectedClub.name}
                    event={selectedEvent}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isEventPayment={true}
                  />
                </Elements>
              )}

              {!eventClientSecret && eventPaymentLoading && (
                <Card className="p-8">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">
                      Preparando inscripción...
                    </p>
                  </div>
                </Card>
              )}

              <Button
                variant="outline"
                onClick={goBack}
                className="w-full mt-6"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Selección
              </Button>
            </div>
          )}

        {/* Step 4: Payment - Class Flow */}
        {step === "payment" &&
          flowType === "class" &&
          selectedClub &&
          selectedInstructor &&
          selectedDate &&
          selectedTime &&
          user && (
            <div
              className={cn(
                "max-w-2xl mx-auto transition-all duration-500 transform",
                "animate-in fade-in slide-in-from-right-4",
              )}
            >
              {classClientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: classClientSecret,
                    locale: "es",
                    appearance: {
                      theme: "stripe",
                    },
                  }}
                >
                  <StripePaymentForm
                    classData={{
                      user_id: user.id,
                      instructor_id: selectedInstructor.id,
                      club_id: selectedClub.id,
                      court_id: selectedCourt?.id,
                      class_type: classType,
                      class_date: format(selectedDate, "yyyy-MM-dd"),
                      start_time: selectedTime,
                      end_time: `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`,
                      duration_minutes: duration,
                      number_of_students: numberOfStudents,
                      total_price:
                        selectedInstructor.hourly_rate * (duration / 60),
                    }}
                    clubId={selectedClub.id}
                    clubName={selectedClub.name}
                    instructor={selectedInstructor}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isClassPayment={true}
                  />
                </Elements>
              )}

              {!classClientSecret && classPaymentLoading && (
                <Card className="p-8">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">
                      Preparando reserva de clase...
                    </p>
                  </div>
                </Card>
              )}

              <Button
                variant="outline"
                onClick={goBack}
                className="w-full mt-6"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Selección
              </Button>
            </div>
          )}

        {/* Payment Success Modal */}
        <PaymentSuccessModal
          open={showSuccessModal}
          onClose={goBack}
          bookingNumber={
            flowType === "booking"
              ? bookingNumber
              : flowType === "class"
                ? classBookingNumber
                : undefined
          }
          registrationNumber={
            flowType === "event" ? registrationNumber : undefined
          }
          isEventRegistration={flowType === "event"}
        />

        {/* Payment Failed Modal */}
        <PaymentFailedModal
          open={showFailedModal}
          onClose={() => {
            setShowFailedModal(false);
            setStep("datetime");
            dispatch(resetPayment());
          }}
          onRetry={handleRetryPayment}
        />
      </div>
    </div>
  );
}
