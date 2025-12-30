import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CreditCard,
  Lock,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Target,
  Trophy,
} from "lucide-react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { confirmPayment, setPaymentStatus } from "@/store/slices/paymentSlice";
import { confirmEventPayment } from "@/store/slices/eventPaymentSlice";
import { confirmClassPayment } from "@/store/slices/classPaymentSlice";
import ClubPolicyModal from "./ClubPolicyModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Event } from "@shared/types";

interface Instructor {
  id: number;
  name: string;
  specialties?: string[];
  bio?: string;
  avatar_url?: string;
  rating?: number;
  hourly_rate: number;
}

interface StripePaymentFormProps {
  bookingData?: {
    user_id: number;
    club_id: number;
    court_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_price: number;
  };
  eventData?: {
    user_id: number;
    event_id: number;
    registration_fee: number;
  };
  classData?: {
    user_id: number;
    instructor_id: number;
    club_id: number;
    court_id?: number;
    class_type: string;
    class_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    number_of_students?: number;
    total_price: number;
    focus_areas?: string[];
    student_level?: string;
    notes?: string;
  };
  clubId?: number;
  clubName?: string;
  instructor?: Instructor;
  event?: Event;
  onSuccess: () => void;
  onError: () => void;
  isEventPayment?: boolean;
  isClassPayment?: boolean;
}

export default function StripePaymentForm({
  bookingData,
  eventData,
  classData,
  clubId,
  clubName,
  instructor,
  event,
  onSuccess,
  onError,
  isEventPayment = false,
  isClassPayment = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const { paymentIntentId, loading, error } = useAppSelector((state) =>
    isEventPayment
      ? state.eventPayment
      : isClassPayment
        ? state.classPayment
        : state.payment,
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<
    "terms" | "privacy" | "cancellation"
  >("terms");

  const handleOpenPolicy = (type: "terms" | "privacy" | "cancellation") => {
    setSelectedPolicyType(type);
    setShowPolicyModal(true);
  };

  // Reset status when component mounts
  useEffect(() => {
    dispatch(setPaymentStatus("idle"));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntentId) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    dispatch(setPaymentStatus("processing"));

    try {
      // Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/booking",
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setErrorMessage(stripeError.message || "Payment failed");
        dispatch(setPaymentStatus("failed"));
        setIsProcessing(false);
        onError();
        return;
      }

      // Confirm payment on backend
      if (isEventPayment && eventData) {
        // Event registration flow
        const result = await dispatch(
          confirmEventPayment({
            payment_intent_id: paymentIntentId,
            user_id: eventData.user_id,
            event_id: eventData.event_id,
            registration_fee: eventData.registration_fee,
          }),
        ).unwrap();
      } else if (isClassPayment && classData) {
        // Private class booking flow
        const result = await dispatch(
          confirmClassPayment({
            payment_intent_id: paymentIntentId,
            ...classData,
          }),
        ).unwrap();
      } else if (bookingData) {
        // Court booking flow
        const result = await dispatch(
          confirmPayment({
            paymentIntentId,
            bookingData,
          }),
        ).unwrap();
      }

      dispatch(setPaymentStatus("succeeded"));
      setIsProcessing(false);
      onSuccess();
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      setErrorMessage(error.message || "Payment failed");
      dispatch(setPaymentStatus("failed"));
      setIsProcessing(false);
      onError();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Summary - Only shown for events */}
      {isEventPayment && eventData && event && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-900">
            <Trophy className="h-5 w-5 text-orange-600" />
            Resumen de Inscripción
          </h3>

          {/* Event Info */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                {event.event_type === "tournament"
                  ? "Torneo"
                  : event.event_type === "league"
                    ? "Liga"
                    : event.event_type === "clinic"
                      ? "Clínica"
                      : event.event_type === "social"
                        ? "Social"
                        : "Campeonato"}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-gray-600 mb-3">{event.description}</p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {clubName && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Club</p>
                  <p className="font-medium text-gray-900">{clubName}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Fecha</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(event.event_date), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Horario</p>
                <p className="font-medium text-gray-900">
                  {event.start_time.substring(0, 5)} -{" "}
                  {event.end_time.substring(0, 5)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Participantes</p>
                <p className="font-medium text-gray-900">
                  {event.current_participants}/{event.max_participants || "∞"}
                  {event.skill_level && (
                    <span className="text-gray-500 ml-2">
                      • Nivel:{" "}
                      {event.skill_level === "all"
                        ? "Todos"
                        : event.skill_level === "beginner"
                          ? "Principiante"
                          : event.skill_level === "intermediate"
                            ? "Intermedio"
                            : event.skill_level === "advanced"
                              ? "Avanzado"
                              : "Experto"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {event.prize_pool && Number(event.prize_pool) > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-800 font-medium">
                    Premio del Torneo
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    ${Number(event.prize_pool).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Registration Fee */}
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Cuota de Inscripción
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ${eventData.registration_fee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Class Summary - Only shown for private classes */}
      {isClassPayment && classData && instructor && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-900">
            <GraduationCap className="h-5 w-5 text-green-600" />
            Resumen de la Clase
          </h3>

          {/* Instructor Info */}
          <div className="bg-white rounded-lg p-4 mb-4">
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
                <h4 className="font-bold text-gray-900 mb-1">
                  {instructor.name}
                </h4>
                {instructor.bio && (
                  <p className="text-sm text-gray-600 mb-2">{instructor.bio}</p>
                )}
                {instructor.specialties &&
                  instructor.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
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
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${instructor.hourly_rate}/hr
                </div>
              </div>
            </div>
          </div>

          {/* Class Details */}
          <div className="space-y-3">
            {clubName && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Club</p>
                  <p className="font-medium text-gray-900">{clubName}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Fecha</p>
                <p className="font-medium text-gray-900">
                  {format(
                    new Date(classData.class_date),
                    "dd 'de' MMMM, yyyy",
                    {
                      locale: es,
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Horario</p>
                <p className="font-medium text-gray-900">
                  {classData.start_time.substring(0, 5)} -{" "}
                  {classData.end_time.substring(0, 5)}
                  <span className="text-gray-500 ml-2">
                    ({classData.duration_minutes} min)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Tipo de Clase</p>
                <p className="font-medium text-gray-900">
                  {classData.class_type === "individual"
                    ? "Individual"
                    : classData.class_type === "semi_private"
                      ? "Semi-Privada"
                      : "Grupal"}
                  {classData.number_of_students &&
                    classData.number_of_students > 1 && (
                      <span className="text-gray-500 ml-1">
                        ({classData.number_of_students} estudiantes)
                      </span>
                    )}
                </p>
              </div>
            </div>

            {/* Total Price */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  ${classData.total_price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Información de Pago</h3>
            <p className="text-sm text-muted-foreground">
              Pago seguro con Stripe
            </p>
          </div>
        </div>

        {/* Stripe Payment Element */}
        <div className="mb-6">
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  email: "",
                },
              },
            }}
          />
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Tu información de pago está protegida con encriptación SSL de nivel
            bancario. No almacenamos datos de tu tarjeta.
          </p>
        </div>
      </Card>

      {/* Error Message */}
      {(errorMessage || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage || error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing || loading}
        className="w-full"
        size="lg"
      >
        {isProcessing || loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar $
            {isEventPayment && eventData
              ? eventData.registration_fee.toFixed(2)
              : isClassPayment && classData
                ? classData.total_price.toFixed(2)
                : bookingData!.total_price.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Al realizar el pago, aceptas los{" "}
        <button
          type="button"
          onClick={() => handleOpenPolicy("terms")}
          className="text-primary hover:underline font-medium"
        >
          términos y condiciones
        </button>{" "}
        y la{" "}
        <button
          type="button"
          onClick={() => handleOpenPolicy("cancellation")}
          className="text-primary hover:underline font-medium"
        >
          política de cancelación
        </button>{" "}
        del club. Lee nuestra{" "}
        <button
          type="button"
          onClick={() => handleOpenPolicy("privacy")}
          className="text-primary hover:underline font-medium"
        >
          política de privacidad
        </button>
        .
      </p>

      {/* Policy Modal */}
      <ClubPolicyModal
        open={showPolicyModal}
        onOpenChange={setShowPolicyModal}
        clubId={clubId || bookingData?.club_id || 0}
        policyType={selectedPolicyType}
      />
    </form>
  );
}
