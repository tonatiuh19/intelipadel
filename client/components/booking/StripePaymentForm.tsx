import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CreditCard, Lock } from "lucide-react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { confirmPayment, setPaymentStatus } from "@/store/slices/paymentSlice";

interface StripePaymentFormProps {
  bookingData: {
    user_id: number;
    club_id: number;
    court_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_price: number;
  };
  onSuccess: () => void;
  onError: () => void;
}

export default function StripePaymentForm({
  bookingData,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const { paymentIntentId, loading, error } = useAppSelector(
    (state) => state.payment,
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // Confirm payment on backend and create booking
      const result = await dispatch(
        confirmPayment({
          paymentIntentId,
          bookingData,
        }),
      ).unwrap();

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
            Pagar ${bookingData.total_price.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Al realizar el pago, aceptas nuestros{" "}
        <a href="#" className="text-primary hover:underline">
          términos y condiciones
        </a>{" "}
        y la{" "}
        <a href="#" className="text-primary hover:underline">
          política de cancelación
        </a>
        .
      </p>
    </form>
  );
}
