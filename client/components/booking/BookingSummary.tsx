import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CreditCard, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Club } from "@shared/types";

interface Court {
  id: number;
  name: string;
  court_type: string;
}

interface BookingSummaryProps {
  club: Club;
  court: Court;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  onBack?: () => void;
}

export default function BookingSummary({
  club,
  court,
  date,
  startTime,
  endTime,
  duration,
  totalPrice,
  onBack,
}: BookingSummaryProps) {
  return (
    <Card className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl">Resumen de Reserva</h3>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Club Info */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b">
        <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={club.image_url}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-lg">{club.name}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {club.city}
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Fecha</p>
            <p className="font-semibold">
              {format(date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Horario</p>
            <p className="font-semibold">
              {startTime} - {endTime}
            </p>
            <p className="text-sm text-muted-foreground">
              {duration === 60 ? "1 hora" : `${duration / 60} horas`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Cancha</p>
            <p className="font-semibold">{court.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {court.court_type}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="pt-6 border-t space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Precio por hora</span>
          <span className="font-medium">
            ${Number(club.price_per_hour).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duración</span>
          <span className="font-medium">{duration / 60}h</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-3 border-t">
          <span>Total</span>
          <span className="text-primary">${Number(totalPrice).toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
