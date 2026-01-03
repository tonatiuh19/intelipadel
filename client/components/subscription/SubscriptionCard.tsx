import { ClubSubscription } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  CreditCard,
  Percent,
  Gift,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: ClubSubscription;
  onSubscribe: (subscription: ClubSubscription) => void;
  isUserSubscribed?: boolean;
  isPopular?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export default function SubscriptionCard({
  subscription,
  onSubscribe,
  isUserSubscribed = false,
  isPopular = false,
  loading = false,
  disabled = false,
}: SubscriptionCardProps) {
  const hasBookingBenefit =
    subscription.booking_discount_percent ||
    subscription.booking_credits_monthly;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isPopular && "border-2 border-primary shadow-lg scale-105",
        isUserSubscribed && "border-2 border-green-500",
        "hover:shadow-xl",
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          POPULAR
        </div>
      )}

      {isUserSubscribed && (
        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
          <Check className="h-3 w-3" />
          ACTIVA
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl">{subscription.name}</CardTitle>
          </div>
        </div>
        {subscription.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {subscription.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-center py-4 bg-primary/5 rounded-lg">
          <div className="text-4xl font-bold text-primary">
            ${subscription.price_monthly}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {subscription.currency}/mes
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2.5">
          {hasBookingBenefit && (
            <div className="flex items-start gap-2">
              {subscription.booking_discount_percent ? (
                <>
                  <Percent className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>{subscription.booking_discount_percent}%</strong> de
                    descuento en reservas
                  </span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>{subscription.booking_credits_monthly}</strong>{" "}
                    créditos mensuales para reservas
                  </span>
                </>
              )}
            </div>
          )}

          {subscription.bar_discount_percent && (
            <div className="flex items-start gap-2">
              <Percent className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>{subscription.bar_discount_percent}%</strong> descuento
                en bar
              </span>
            </div>
          )}

          {subscription.merch_discount_percent && (
            <div className="flex items-start gap-2">
              <Gift className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>{subscription.merch_discount_percent}%</strong>{" "}
                descuento en tienda
              </span>
            </div>
          )}

          {subscription.event_discount_percent && (
            <div className="flex items-start gap-2">
              <Percent className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>{subscription.event_discount_percent}%</strong>{" "}
                descuento en eventos
              </span>
            </div>
          )}

          {subscription.class_discount_percent && (
            <div className="flex items-start gap-2">
              <Percent className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                <strong>{subscription.class_discount_percent}%</strong>{" "}
                descuento en clases
              </span>
            </div>
          )}

          {subscription.extras && subscription.extras.length > 0 && (
            <>
              {subscription.extras.map((extra) => (
                <div key={extra.id} className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{extra.description}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Max subscribers warning */}
        {subscription.max_subscribers &&
          subscription.current_subscribers >= subscription.max_subscribers && (
            <Badge variant="secondary" className="w-full justify-center">
              Cupo Lleno
            </Badge>
          )}

        {/* Subscribe Button */}
        <Button
          onClick={() => onSubscribe(subscription)}
          disabled={
            disabled ||
            isUserSubscribed ||
            loading ||
            (subscription.max_subscribers
              ? subscription.current_subscribers >= subscription.max_subscribers
              : false)
          }
          className="w-full"
          size="lg"
        >
          {isUserSubscribed ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Suscrito
            </>
          ) : loading ? (
            "Procesando..."
          ) : (
            <>
              <Crown className="mr-2 h-4 w-4" />
              Suscribirse
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
