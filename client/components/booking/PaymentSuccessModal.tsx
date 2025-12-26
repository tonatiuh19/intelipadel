import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  bookingNumber?: string;
}

export default function PaymentSuccessModal({
  open,
  onClose,
  bookingNumber,
}: PaymentSuccessModalProps) {
  const navigate = useNavigate();

  const handleViewBookings = () => {
    navigate("/bookings");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100",
              "animate-in zoom-in-50 duration-500",
            )}
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            ¡Pago Exitoso!
          </DialogTitle>
          <DialogDescription className="text-center">
            Tu reserva ha sido confirmada exitosamente.
          </DialogDescription>
        </DialogHeader>

        {bookingNumber && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Número de Reserva
            </p>
            <p className="text-lg font-bold text-primary">{bookingNumber}</p>
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Recibirás un correo de confirmación con todos los detalles
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Puedes ver tu reserva en la sección "Mis Reservas"
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Te esperamos en la fecha y hora reservada
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
