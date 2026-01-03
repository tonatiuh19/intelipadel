import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Crown,
  Loader2,
} from "lucide-react";
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
import SubscriptionModal from "@/components/subscription/SubscriptionModal";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAvailableSubscriptions,
  fetchUserSubscription,
  subscribe,
  clearAvailableSubscriptions,
} from "@/store/slices/userSubscriptionsSlice";

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
  const {
    availableSubscriptions,
    userSubscription,
    loading: subscriptionsLoading,
  } = useAppSelector((state) => state.userSubscriptions);
  const { toast } = useToast();

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
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [calculatedEventPrice, setCalculatedEventPrice] = useState<
    number | null
  >(null);
  const [calculatedClassPrice, setCalculatedClassPrice] = useState<
    number | null
  >(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [bookingNumber, setBookingNumber] = useState<string>("");
  const [processingEventId, setProcessingEventId] = useState<number | null>(
    null,
  );
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedClubForSubscription, setSelectedClubForSubscription] =
    useState<Club | null>(null);

  useEffect(() => {
    dispatch(fetchClubs());
  }, [dispatch]);

  // Fetch user subscription when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserSubscription(user.id));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // Load default duration when club is selected
  useEffect(() => {
    if (selectedClub && selectedClub.default_booking_duration) {
      setDuration(selectedClub.default_booking_duration);
    }
  }, [selectedClub]);

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

  // Watch for authentication success to proceed to payment or open subscription modal
  useEffect(() => {
    if (step === "auth" && isAuthenticated && user) {
      setShowAuthModal(false);

      // Check if we were trying to view subscriptions
      if (selectedClubForSubscription && !flowType) {
        dispatch(fetchAvailableSubscriptions(selectedClubForSubscription.id));
        setShowSubscriptionModal(true);
        setStep("club");
        return;
      }

      if (flowType === "event") {
        handleProceedToEventPayment();
      } else if (flowType === "class") {
        handleProceedToClassPayment();
      } else {
        handleProceedToPayment();
      }
    }
  }, [isAuthenticated, step, flowType, user, selectedClubForSubscription]);

  // Calculate price when date/time/duration changes OR when user changes (for subscription discount)
  useEffect(() => {
    if (
      selectedClub &&
      selectedDate &&
      selectedTime &&
      duration &&
      selectedCourt
    ) {
      calculatePrice();
    }
  }, [selectedClub, selectedDate, selectedTime, duration, selectedCourt, user]);

  const calculatePrice = async () => {
    if (!selectedClub || !selectedDate || !selectedTime || !duration) return;

    setIsCalculating(true);
    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          club_id: selectedClub.id,
          court_id: selectedCourt?.id,
          booking_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          duration_minutes: duration,
          user_id: user?.id, // Pass user_id to apply subscription discounts
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculatedPrice(data.data.total_price);
      } else {
        console.error("Failed to calculate price");
        // Fallback to base price (fixed for duration block)
        setCalculatedPrice(parseFloat(selectedClub.price_per_hour.toString()));
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      // Fallback to base price (fixed for duration block)
      setCalculatedPrice(parseFloat(selectedClub.price_per_hour.toString()));
    } finally {
      setIsCalculating(false);
    }
  };

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

  const handleViewSubscriptions = (club: Club, event: React.MouseEvent) => {
    event.stopPropagation();

    // Check if user is authenticated
    if (!isAuthenticated || !user || !user.email) {
      // Set club_id before showing auth modal
      dispatch(setTempClubId(club.id));
      setSelectedClubForSubscription(club);
      setStep("auth");
      setShowAuthModal(true);
      return;
    }

    setSelectedClubForSubscription(club);
    dispatch(fetchAvailableSubscriptions(club.id));
    setShowSubscriptionModal(true);
  };

  const handleSubscribe = async (
    subscriptionId: number,
    paymentMethodId: string,
  ) => {
    if (!user || !selectedClubForSubscription) return;

    try {
      await dispatch(
        subscribe({
          userId: user.id,
          subscriptionId,
          paymentMethodId,
        }),
      ).unwrap();

      toast({
        title: "¡Suscripción Exitosa!",
        description:
          "Tu suscripción ha sido activada. Disfruta de tus beneficios.",
      });

      setShowSubscriptionModal(false);
      setSelectedClubForSubscription(null);
      dispatch(clearAvailableSubscriptions());
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo completar la suscripción",
        variant: "destructive",
      });
    }
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

    // Calculate discounted price if user has subscription
    let finalPrice = Number(event.registration_fee);
    console.log("🎯 Event Registration - Original Price:", finalPrice);
    console.log("🎯 User Subscription:", userSubscription);

    if (
      userSubscription?.status === "active" &&
      userSubscription.subscription?.event_discount_percent
    ) {
      const discountPercent =
        userSubscription.subscription.event_discount_percent;
      const discount = (finalPrice * discountPercent) / 100;
      finalPrice = finalPrice - discount;
      console.log(`🎯 Discount Applied: ${discountPercent}% = $${discount}`);
      console.log(`🎯 Final Price After Discount: $${finalPrice}`);
    } else {
      console.log(
        "🎯 No discount applied - subscription status:",
        userSubscription?.status,
      );
      console.log(
        "🎯 Discount percent:",
        userSubscription?.subscription?.event_discount_percent,
      );
    }

    console.log(`🎯 Setting calculatedEventPrice to: $${finalPrice}`);
    setCalculatedEventPrice(finalPrice);

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
        console.log(
          `🎯 About to create payment intent with price: $${finalPrice}`,
        );
        await handleProceedToEventPayment(event, finalPrice);
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

    // Calculate discounted price if user has subscription
    let basePrice = instructor.hourly_rate * (duration / 60);
    let finalPrice = basePrice;
    console.log("🎓 Class - Base Price:", basePrice);

    if (
      userSubscription?.status === "active" &&
      userSubscription.subscription?.class_discount_percent
    ) {
      const discountPercent =
        userSubscription.subscription.class_discount_percent;
      const discount = (basePrice * discountPercent) / 100;
      finalPrice = basePrice - discount;
      console.log(`🎓 Discount Applied: ${discountPercent}% = $${discount}`);
      console.log(`🎓 Final Price: $${finalPrice}`);
    }

    console.log(`🎓 Setting calculatedClassPrice to: $${finalPrice}`);
    setCalculatedClassPrice(finalPrice);

    // Store the calculated price for later use
    const calculatedPriceRef = finalPrice;

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

  const handleProceedToEventPayment = async (
    event?: Event,
    priceOverride?: number,
  ) => {
    const eventToUse = event || selectedEvent;

    if (!eventToUse || !user) {
      console.error("❌ Missing event or user:", { eventToUse, user });
      return;
    }

    // IMPORTANT: Use passed price (from calculation), state, or original price
    const finalPrice =
      priceOverride !== undefined
        ? priceOverride
        : calculatedEventPrice !== null
          ? calculatedEventPrice
          : Number(eventToUse.registration_fee);

    console.log("💰💰💰 PAYMENT INTENT CREATION 💰💰💰");
    console.log("Original Event Price:", eventToUse.registration_fee);
    console.log("Calculated Discounted Price:", calculatedEventPrice);
    console.log("Final Price Being Sent:", finalPrice);
    console.log("User Subscription:", userSubscription?.status);
    console.log(
      "Discount %:",
      userSubscription?.subscription?.event_discount_percent,
    );

    const eventData = {
      user_id: user.id,
      event_id: eventToUse.id,
      registration_fee: finalPrice,
    };

    console.log("📤 Sending to backend:", JSON.stringify(eventData, null, 2));

    try {
      // Create payment intent for event with the discounted price
      const result = await dispatch(
        createEventPaymentIntent(eventData),
      ).unwrap();
      console.log("✅ Payment intent created:", result);
      setStep("payment");
    } catch (error: any) {
      console.error("❌ Event payment intent error:", error);

      // Extract error message from various possible error structures
      const errorMessage =
        error?.message ||
        error?.error ||
        (typeof error === "string" ? error : null) ||
        "No se pudo procesar la inscripción";

      // Show error message to user
      toast({
        title: "Error de Inscripción",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset state
      setProcessingEventId(null);
      setSelectedEvent(null);
      setFlowType(null);
    }
  };

  const handleProceedToClassPayment = async () => {
    if (
      !selectedClub ||
      !selectedInstructor ||
      !selectedDate ||
      !selectedTime ||
      !user
    ) {
      console.error("❌ Missing required data for class payment");
      return;
    }

    const endTime = `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`;

    // IMPORTANT: Use calculated price (includes subscription discount) or calculate from hourly rate
    const basePrice = selectedInstructor.hourly_rate * (duration / 60);
    const finalPrice =
      calculatedClassPrice !== null ? calculatedClassPrice : basePrice;

    console.log("💰💰💰 CLASS PAYMENT INTENT CREATION 💰💰💰");
    console.log("Base Price:", basePrice);
    console.log("Calculated Discounted Price:", calculatedClassPrice);
    console.log("Final Price Being Sent:", finalPrice);
    console.log("User Subscription:", userSubscription?.status);
    console.log(
      "Discount %:",
      userSubscription?.subscription?.class_discount_percent,
    );

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
      total_price: finalPrice,
    };

    console.log("📤 Sending to backend:", JSON.stringify(classData, null, 2));

    // Create payment intent for class with the discounted price
    const result = await dispatch(createClassPaymentIntent(classData));
    console.log("✅ Class payment intent created:", result);
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

    // Wait for price calculation to complete if still calculating
    if (isCalculating) {
      console.log("Waiting for price calculation...");
      return;
    }

    // IMPORTANT: Use calculated price (includes discounts) or fallback to base price
    const finalPrice =
      calculatedPrice !== null
        ? calculatedPrice
        : parseFloat(selectedClub.price_per_hour.toString());

    console.log("💰 Creating payment intent with price:", finalPrice);

    const bookingData = {
      user_id: user.id,
      club_id: selectedClub.id,
      court_id: selectedCourt.id,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedTime,
      end_time: `${parseInt(selectedTime.split(":")[0]) + Math.floor(duration / 60)}:${selectedTime.split(":")[1].padStart(2, "0")}`,
      duration_minutes: duration,
      total_price: finalPrice,
    };

    // Create payment intent with the discounted price
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
                      {club.has_subscriptions && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                            <Crown className="h-3 w-3 mr-1" />
                            Membresías
                          </Badge>
                        </div>
                      )}
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

                      {club.has_subscriptions && (
                        <Button
                          variant="outline"
                          className="w-full mb-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                          size="sm"
                          onClick={(e) => handleViewSubscriptions(club, e)}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Ver Membresías
                        </Button>
                      )}

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
              duration={duration}
              calculatedPrice={calculatedPrice}
              userSubscription={userSubscription}
            />

            {/* Duration & Price */}
            {selectedTime && flowType === "booking" && (
              <Card
                className={cn(
                  "p-6 bg-gradient-to-br from-primary/10 to-primary/5",
                  "animate-in fade-in slide-in-from-bottom-4",
                )}
              >
                <div className="space-y-4">
                  {userSubscription && userSubscription.status === "active" && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-amber-900 mb-1">
                            ✨ Beneficio de Membresía Aplicado
                          </p>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            {userSubscription.subscription
                              ?.booking_discount_percent && (
                              <>
                                Descuento del{" "}
                                <span className="font-bold">
                                  {
                                    userSubscription.subscription
                                      .booking_discount_percent
                                  }
                                  %
                                </span>{" "}
                                aplicado a tu reserva
                              </>
                            )}
                            {userSubscription.subscription
                              ?.booking_credits_monthly && (
                              <>
                                Tienes{" "}
                                <span className="font-bold">
                                  {userSubscription.subscription
                                    .booking_credits_monthly -
                                    (userSubscription.bookings_used_this_month ||
                                      0)}
                                </span>{" "}
                                créditos disponibles este mes
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Duración</span>
                    <span className="font-semibold">
                      {duration === 60 && "1 Hora"}
                      {duration === 90 && "1.5 Horas"}
                      {duration === 120 && "2 Horas"}
                      {duration !== 60 &&
                        duration !== 90 &&
                        duration !== 120 &&
                        `${duration} min`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-bold text-lg">Precio Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {isCalculating
                        ? "Calculando..."
                        : `$${(calculatedPrice !== null ? calculatedPrice : parseFloat(selectedClub.price_per_hour.toString())).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Event/Class Subscription Benefit Banner */}
            {userSubscription &&
              userSubscription.status === "active" &&
              !selectedTime &&
              (userSubscription.subscription?.event_discount_percent ||
                userSubscription.subscription?.class_discount_percent) && (
                <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-900 mb-1">
                        ✨ Beneficios de Membresía Disponibles
                      </p>
                      <div className="text-xs text-amber-800 leading-relaxed space-y-1">
                        {userSubscription.subscription
                          ?.event_discount_percent && (
                          <p>
                            • Descuento del{" "}
                            <span className="font-bold">
                              {
                                userSubscription.subscription
                                  .event_discount_percent
                              }
                              %
                            </span>{" "}
                            en inscripciones a eventos
                          </p>
                        )}
                        {userSubscription.subscription
                          ?.class_discount_percent && (
                          <p>
                            • Descuento del{" "}
                            <span className="font-bold">
                              {
                                userSubscription.subscription
                                  .class_discount_percent
                              }
                              %
                            </span>{" "}
                            en clases privadas
                          </p>
                        )}
                      </div>
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
                  disabled={
                    flowType === "class"
                      ? classPaymentLoading || isCalculating
                      : paymentLoading ||
                        (flowType === "booking" && isCalculating)
                  }
                  className="flex-1"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando precio...
                    </>
                  ) : flowType === "class" && classPaymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : flowType === "booking" && paymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
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
                          calculatedPrice !== null
                            ? calculatedPrice
                            : parseFloat(
                                selectedClub.price_per_hour.toString(),
                              ),
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
                  totalPrice={
                    calculatedPrice !== null
                      ? calculatedPrice
                      : parseFloat(selectedClub.price_per_hour.toString())
                  }
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
                      registration_fee:
                        calculatedEventPrice !== null
                          ? calculatedEventPrice
                          : Number(selectedEvent.registration_fee),
                    }}
                    clubId={selectedClub.id}
                    clubName={selectedClub.name}
                    event={selectedEvent}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isEventPayment={true}
                    eventDiscountPercent={0}
                    originalEventPrice={Number(selectedEvent.registration_fee)}
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
                        calculatedClassPrice !== null
                          ? calculatedClassPrice
                          : selectedInstructor.hourly_rate * (duration / 60),
                    }}
                    clubId={selectedClub.id}
                    clubName={selectedClub.name}
                    instructor={selectedInstructor}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isClassPayment={true}
                    classDiscountPercent={0}
                    originalClassPrice={
                      selectedInstructor.hourly_rate * (duration / 60)
                    }
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

        {/* Subscription Modal */}
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedClubForSubscription(null);
            dispatch(clearAvailableSubscriptions());
          }}
          subscriptions={availableSubscriptions}
          onSubscribe={handleSubscribe}
          loading={subscriptionsLoading}
          userSubscriptionId={userSubscription?.subscription_id || null}
          userEmail={user?.email}
          hasActiveSubscription={
            userSubscription?.subscription &&
            userSubscription.status === "active"
          }
        />
      </div>
    </div>
  );
}
