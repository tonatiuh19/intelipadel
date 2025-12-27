import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  bookingNumber?: string;
  registrationNumber?: string;
  isEventRegistration?: boolean;
}

export default function PaymentSuccessModal({
  open,
  onClose,
  bookingNumber,
  registrationNumber,
  isEventRegistration = false,
}: PaymentSuccessModalProps) {
  const navigate = useNavigate();

  const handleViewBookings = () => {
    navigate("/bookings");
  };

  const displayNumber = isEventRegistration
    ? registrationNumber
    : bookingNumber;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full",
              isEventRegistration ? "bg-orange-100" : "bg-green-100",
              "animate-in zoom-in-50 duration-500",
            )}
          >
            {isEventRegistration ? (
              <Trophy className="h-10 w-10 text-orange-600" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {isEventRegistration ? "¡Inscripción Exitosa!" : "¡Pago Exitoso!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isEventRegistration
              ? "Tu inscripción al evento ha sido confirmada exitosamente."
              : "Tu reserva ha sido confirmada exitosamente."}
          </DialogDescription>
        </DialogHeader>

        {displayNumber && (
          <div
            className={cn(
              "rounded-lg p-4 text-center",
              isEventRegistration ? "bg-orange-50" : "bg-muted/50",
            )}
          >
            <p className="text-sm text-muted-foreground mb-1">
              {isEventRegistration
                ? "Número de Inscripción"
                : "Número de Reserva"}
            </p>
            <p
              className={cn(
                "text-lg font-bold",
                isEventRegistration ? "text-orange-600" : "text-primary",
              )}
            >
              {displayNumber}
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span
              className={
                isEventRegistration ? "text-orange-600" : "text-primary"
              }
            >
              ✓
            </span>
            Recibirás un correo de confirmación con todos los detalles
          </p>
          <p className="flex items-start gap-2">
            <span
              className={
                isEventRegistration ? "text-orange-600" : "text-primary"
              }
            >
              ✓
            </span>
            {isEventRegistration
              ? "Llega al menos 15 minutos antes del evento"
              : 'Puedes ver tu reserva en la sección "Mis Reservas"'}
          </p>
          <p className="flex items-start gap-2">
            <span
              className={
                isEventRegistration ? "text-orange-600" : "text-primary"
              }
            >
              ✓
            </span>
            {isEventRegistration
              ? "Recuerda llevar tu equipo y estar listo para jugar"
              : "Te esperamos en la fecha y hora reservada"}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleViewBookings}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Ver Mis Reservas
          </Button>
          <Button onClick={onClose} size="lg" className="w-full">
            Nueva Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
