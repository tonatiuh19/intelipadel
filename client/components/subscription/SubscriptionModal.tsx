import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClubSubscription } from "@shared/types";
import SubscriptionCard from "./SubscriptionCard";
import PaymentMethodForm from "./PaymentMethodForm";
import { Crown, CreditCard, Check, ArrowRight, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  subscriptions: ClubSubscription[];
  onSubscribe: (
    subscriptionId: number,
    paymentMethodId: string,
  ) => Promise<void>;
  loading?: boolean;
  userSubscriptionId?: number | null;
  userEmail?: string;
  hasActiveSubscription?: boolean;
}

export default function SubscriptionModal({
  open,
  onClose,
  subscriptions,
  onSubscribe,
  loading = false,
  userSubscriptionId = null,
  userEmail,
  hasActiveSubscription = false,
}: SubscriptionModalProps) {
  const [step, setStep] = useState<"select" | "payment" | "confirm">("select");
  const [selectedSubscription, setSelectedSubscription] =
    useState<ClubSubscription | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentMethodDetails, setPaymentMethodDetails] = useState<{
    brand: string;
    last4: string;
  } | null>(null);

  const handleSelectSubscription = (subscription: ClubSubscription) => {
    setSelectedSubscription(subscription);
    setStep("payment");
  };

  const handlePaymentMethodSuccess = async (
    paymentMethodId: string,
    details?: { brand: string; last4: string },
  ) => {
    if (!selectedSubscription) return;

    setPaymentMethodId(paymentMethodId);
    setPaymentMethodDetails(details || null);
    setStep("confirm");
  };

  const handleConfirmSubscription = async () => {
    if (!selectedSubscription || !paymentMethodId) return;

    try {
      await onSubscribe(selectedSubscription.id, paymentMethodId);
      handleClose();
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedSubscription(null);
    setPaymentMethodId("");
    setPaymentMethodDetails(null);
    onClose();
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("payment");
    } else {
      setStep("select");
      setSelectedSubscription(null);
      setPaymentMethodId("");
      setPaymentMethodDetails(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white border-0 overflow-hidden [&>button]:top-6 [&>button]:right-6 [&>button]:z-10 [&>button]:bg-white/80 [&>button]:hover:bg-white [&>button]:backdrop-blur-sm">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 pr-8">
            <Crown className="h-6 w-6 text-amber-500" />
            {step === "select" && "Elige Tu Suscripción"}
            {step === "payment" && "Configura Tu Método de Pago"}
            {step === "confirm" && "Confirma Tu Suscripción"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "select" &&
              "Selecciona el plan que mejor se adapte a tus necesidades"}
            {step === "payment" &&
              "Agrega una tarjeta para activar tu suscripción"}
            {step === "confirm" &&
              "Revisa y confirma los detalles de tu suscripción"}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-white">
          {step === "select" && (
            <>
              {hasActiveSubscription && (
                <Alert className="mb-6 bg-blue-50 border-blue-200 flex items-start gap-3">
                  <Settings className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <AlertDescription className="text-blue-900 text-sm">
                      Ya tienes una suscripción activa. Para modificar o
                      cancelar tu suscripción, ve a tu perfil.
                    </AlertDescription>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = "/profile";
                      }}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 flex-shrink-0"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ir a Mi Perfil
                    </Button>
                  </div>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions
                  .filter((sub) => sub.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((subscription, index) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onSubscribe={handleSelectSubscription}
                      isUserSubscribed={subscription.id === userSubscriptionId}
                      isPopular={index === 1} // Middle option is popular
                      loading={loading}
                      disabled={hasActiveSubscription}
                    />
                  ))}
              </div>
            </>
          )}

          {step === "payment" && selectedSubscription && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Selected Subscription Summary */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      {selectedSubscription.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${selectedSubscription.price_monthly}{" "}
                      {selectedSubscription.currency}/mes
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Cambiar
                  </Button>
                </div>
              </div>

              {/* Payment Method Form */}
              <PaymentMethodForm
                onSuccess={handlePaymentMethodSuccess}
                onCancel={handleBack}
                loading={loading}
                userEmail={userEmail}
              />

              {/* Benefits Reminder */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-green-900">
                      ¡Activación Inmediata!
                    </p>
                    <p className="text-sm text-green-700">
                      Tus beneficios estarán disponibles tan pronto completes el
                      pago. Puedes cancelar en cualquier momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "confirm" && selectedSubscription && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Subscription Summary */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Resumen de Suscripción
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-semibold">
                      {selectedSubscription.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-bold text-xl text-amber-600">
                      ${selectedSubscription.price_monthly}{" "}
                      {selectedSubscription.currency}/mes
                    </span>
                  </div>
                  {selectedSubscription.booking_discount_percent > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Descuento en reservas:
                      </span>
                      <span className="font-semibold text-green-600">
                        {selectedSubscription.booking_discount_percent}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Summary */}
              {paymentMethodDetails && (
                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Método de Pago
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground capitalize">
                        {paymentMethodDetails.brand} ••••{" "}
                        {paymentMethodDetails.last4}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}

              {/* Benefits List */}
              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-bold text-lg mb-4">Beneficios Incluidos</h3>
                <div className="space-y-3">
                  {selectedSubscription.booking_discount_percent > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong>
                          {selectedSubscription.booking_discount_percent}% de
                          descuento
                        </strong>{" "}
                        en todas tus reservas
                      </p>
                    </div>
                  )}
                  {selectedSubscription.event_discount_percent > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong>
                          {selectedSubscription.event_discount_percent}% de
                          descuento
                        </strong>{" "}
                        en eventos
                      </p>
                    </div>
                  )}
                  {selectedSubscription.class_discount_percent > 0 && (
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong>
                          {selectedSubscription.class_discount_percent}% de
                          descuento
                        </strong>{" "}
                        en clases privadas
                      </p>
                    </div>
                  )}
                  {selectedSubscription.extras &&
                    selectedSubscription.extras.length > 0 &&
                    (typeof selectedSubscription.extras === "string"
                      ? JSON.parse(selectedSubscription.extras)
                      : selectedSubscription.extras
                    ).map((extra: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{extra}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Renovación automática:</strong> Tu suscripción se
                  renovará automáticamente cada mes. Puedes cancelar en
                  cualquier momento desde tu perfil.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleConfirmSubscription}
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Suscripción
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
