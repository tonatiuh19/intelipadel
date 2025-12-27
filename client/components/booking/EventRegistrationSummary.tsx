import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Event } from "@shared/types";

interface EventRegistrationSummaryProps {
  event: Event;
  clubName: string;
  clubImage: string;
  totalPrice: number;
}

export default function EventRegistrationSummary({
  event,
  clubName,
  clubImage,
  totalPrice,
}: EventRegistrationSummaryProps) {
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
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Cuota de Inscripción
            </span>
            <span className="text-sm font-medium">
              ${totalPrice.toFixed(2)} MXN
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="font-bold">Total a Pagar</span>
            <span className="text-2xl font-bold text-orange-600">
              ${totalPrice.toFixed(2)}
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
