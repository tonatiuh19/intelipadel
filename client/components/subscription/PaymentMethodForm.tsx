import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodFormProps {
  onSuccess: (
    paymentMethodId: string,
    details?: { brand: string; last4: string },
  ) => void;
  onCancel: () => void;
  loading?: boolean;
  userEmail?: string;
}

const validationSchema = Yup.object().shape({
  cardholderName: Yup.string()
    .required("El nombre del titular es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  email: Yup.string()
    .required("El correo electrónico es requerido")
    .email("Correo electrónico inválido"),
});

function PaymentMethodFormContent({
  onSuccess,
  onCancel,
  loading = false,
  userEmail,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      cardholderName: "",
      email: userEmail || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Error al procesar la tarjeta");
        setIsProcessing(false);
        return;
      }

      try {
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: values.cardholderName,
            email: values.email,
          },
        });

        if (error) {
          setError(error.message || "Error al procesar la tarjeta");
          setIsProcessing(false);
          return;
        }

        if (paymentMethod) {
          const details = {
            brand: paymentMethod.card?.brand || "card",
            last4: paymentMethod.card?.last4 || "****",
          };
          onSuccess(paymentMethod.id, details);
        }
      } catch (err: any) {
        setError(err.message || "Error al procesar la tarjeta");
        setIsProcessing(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Agregar Método de Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">
              Nombre del Titular <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              placeholder="Como aparece en la tarjeta"
              value={formik.values.cardholderName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isProcessing || loading}
            />
            {formik.touched.cardholderName && formik.errors.cardholderName && (
              <p className="text-sm text-red-500">
                {formik.errors.cardholderName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isProcessing || loading || !!userEmail}
              readOnly={!!userEmail}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <Label>
              Información de la Tarjeta <span className="text-red-500">*</span>
            </Label>
            <div className="p-3 border rounded-md bg-background">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                  hidePostalCode: false,
                }}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
            <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Tu información de pago está protegida con encriptación de nivel
              bancario. No almacenamos los datos de tu tarjeta.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing || loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing || loading || !formik.isValid}
              className="flex-1"
            >
              {isProcessing || loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Guardar Tarjeta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentMethodForm(props: PaymentMethodFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        locale: "es",
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentMethodFormContent {...props} />
    </Elements>
  );
}
