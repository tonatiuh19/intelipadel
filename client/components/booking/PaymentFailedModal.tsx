import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFailedModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

export default function PaymentFailedModal({
  open,
  onClose,
  onRetry,
  errorMessage,
}: PaymentFailedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100",
              "animate-in zoom-in-50 duration-500",
            )}
          >
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Pago Fallido
          </DialogTitle>
          <DialogDescription className="text-center">
            No pudimos procesar tu pago. Por favor, intenta nuevamente.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Posibles causas:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Fondos insuficientes en la tarjeta</li>
            <li>Información de la tarjeta incorrecta</li>
            <li>Tarjeta expirada o bloqueada</li>
            <li>Problema temporal con el banco</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> No se ha realizado ningún cargo. Puedes
            intentar con otra tarjeta o método de pago.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onRetry} size="lg" className="w-full">
            Reintentar Pago
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
