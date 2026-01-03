import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  DollarSign,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Event } from "@shared/types";

interface EventRegistrationSummaryProps {
  event: Event;
  clubName: string;
  clubImage: string;
  totalPrice: number;
  originalPrice?: number;
  discountApplied?: number;
  feeStructure?: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
  serviceFeePercentage?: number;
}

export default function EventRegistrationSummary({
  event,
  clubName,
  clubImage,
  totalPrice,
  originalPrice,
  discountApplied,
  feeStructure = "club_absorbs_fee",
  serviceFeePercentage = 8,
}: EventRegistrationSummaryProps) {
  // Calculate service fees based on fee structure
  const serviceFee = totalPrice * (serviceFeePercentage / 100);
  let userPaysServiceFee = 0;
  let basePrice = totalPrice;

  if (feeStructure === "user_pays_fee") {
    userPaysServiceFee = serviceFee;
  } else if (feeStructure === "shared_fee") {
    userPaysServiceFee = serviceFee / 2;
  }
  // club_absorbs_fee: userPaysServiceFee = 0

  const subtotal = basePrice + userPaysServiceFee;
  const iva = subtotal * 0.16;
  const totalWithIVA = subtotal + iva;

  const eventTypeLabels: Record<string, string> = {
    tournament: "Torneo",
    league: "Liga",
    clinic: "Clínica",
    social: "Social",
    championship: "Campeonato",
  };

  const skillLevelLabels: Record<string, string> = {
    all: "Todos los Niveles",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto",
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          Resumen de Inscripción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Club Image */}
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={clubImage}
            alt={clubName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Badge */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
            {eventTypeLabels[event.event_type] || event.event_type}
          </span>
        </div>

        {/* Event Title */}
        <div className="text-center">
          <h3 className="font-bold text-xl text-orange-900">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Club</p>
              <p className="text-sm text-muted-foreground">{clubName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Fecha del Evento</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.event_date), "EEEE, d 'de' MMMM yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Horario</p>
              <p className="text-sm text-muted-foreground">
                {event.start_time.substring(0, 5)} -{" "}
                {event.end_time.substring(0, 5)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Participantes</p>
              <p className="text-sm text-muted-foreground">
                {event.current_participants}/{event.max_participants || "∞"}{" "}
                inscritos
              </p>
            </div>
          </div>

          {event.skill_level && event.skill_level !== "all" && (
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nivel</p>
                <p className="text-sm text-muted-foreground">
                  {skillLevelLabels[event.skill_level] || event.skill_level}
                </p>
              </div>
            </div>
          )}

          {event.prize_pool && parseFloat(event.prize_pool.toString()) > 0 && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-900 mb-1">
                Premio del Evento
              </p>
              <p className="text-lg font-bold text-orange-700">
                ${parseFloat(event.prize_pool.toString()).toFixed(2)} MXN
              </p>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-4 border-t space-y-2">
          {discountApplied && discountApplied > 0 && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">
                  Descuento de Membresía
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-800">
                  {originalPrice &&
                    ((discountApplied / originalPrice) * 100).toFixed(0)}
                  % de descuento
                </span>
                <span className="font-semibold text-amber-900">
                  -${discountApplied.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {originalPrice && discountApplied && discountApplied > 0 ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Cuota Original</span>
                <span className="text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Cuota con Descuento
                </span>
                <span className="font-medium text-green-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Cuota de Inscripción
              </span>
              <span className="text-sm font-medium">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="flex justify-between items-center text-sm pt-2 border-t">
            <span className="text-muted-foreground">Cuota de Inscripción</span>
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          </div>

          {/* Service Fee (only if user pays) */}
          {userPaysServiceFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Cargo por Servicio ({serviceFeePercentage}%
                {feeStructure === "shared_fee" ? " ÷ 2" : ""})
              </span>
              <span className="font-medium">
                ${userPaysServiceFee.toFixed(2)}
              </span>
            </div>
          )}

          {feeStructure === "club_absorbs_fee" && (
            <div className="flex justify-between items-center text-xs text-muted-foreground italic">
              <span>Cargo por Servicio</span>
              <span>Incluido</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm pt-2 border-t">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">IVA (16%)</span>
            <span className="font-medium">${iva.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-bold">Total a Pagar</span>
            <span className="text-2xl font-bold text-orange-600">
              ${totalWithIVA.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>Importante:</strong> Llega al menos 15 minutos antes del
            inicio del evento para el registro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
